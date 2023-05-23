import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiConfigService,
  CacheService,
  EmailQueueService,
  OtpService,
} from '../../shared/services';
import { UserService, UserSessionService } from '../user/services';
import {
  RESET_PASS_PROCESS,
  TFA_VERIFY_PROCESS,
  TokenType,
  TwoFactoryMethod,
} from '../../common/constants';
import { reverseString, validateHash } from '../../common/utilities';
import { UserEntity } from '../user/models';
import moment from 'moment';
import {
  TokenPayloadDto,
  UserForgotDto,
  UserLoginDto,
  UserRefreshDto,
  UserResendDto,
  UserResetDto,
  UserVerifyDto,
} from './dtos';
import { isEmpty } from 'lodash';
import { OtpTokenPayloadDto } from './dtos/otp-token-payload.dto';
import { UserLogoutDto } from './dtos/user-logout.dto';
import { v4 } from 'uuid';
import {
  JwtInvalidException,
  OtpInvalidException,
} from '../../common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ApiConfigService,
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly cacheService: CacheService,
    private readonly emailQueueService: EmailQueueService,

    private readonly userSessionService: UserSessionService,
  ) {}

  async login(userLoginDto: UserLoginDto): Promise<TokenPayloadDto> {
    const user = await this.userService.findByEmail(userLoginDto.email);
    if (!user) {
      throw new NotFoundException('Tài khoản hoặc mật khẩu không chính xác!');
    }

    const isPasswordMatch = await validateHash(
      userLoginDto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new NotFoundException('Tài khoản hoặc mật khẩu không chính xác!');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Tài khoản của bạn đã bị khoá! Vui lòng liên hệ Quản trị viên để được xử lý.',
      );
    }

    const session = await this.userSessionService.find(
      userLoginDto.deviceId,
      user.id,
    );
    if (session?.isTrusted) {
      return this.getTokenAndSaveSession(user, {
        deviceId: userLoginDto.deviceId,
        deviceName: userLoginDto.deviceName,
        ipAddress: userLoginDto.ipAddress,
        isTrusted: true,
      });
    }

    switch (user.twoFactory) {
      case TwoFactoryMethod.EMAIL:
        const otp = await this.otpService.generateEmailOtp(
          userLoginDto.deviceId,
          user.email,
        );

        await this.emailQueueService.add(
          TFA_VERIFY_PROCESS,
          {
            otp,
            email: user.email,
            requestDate: moment().format('DD/MM/YYYY HH:mm'),
            deviceName: userLoginDto.deviceName,
          },
          { removeOnComplete: true },
        );

        return new TokenPayloadDto({
          twoFactoryMethod: user.twoFactory,
        });
      case TwoFactoryMethod.OTP:
        return new TokenPayloadDto({
          twoFactoryMethod: user.twoFactory,
          requiredOtpToken: isEmpty(user.optSecret),
        });
      default:
        return this.getTokenAndSaveSession(user, {
          deviceId: userLoginDto.deviceId,
          deviceName: userLoginDto.deviceName,
          ipAddress: userLoginDto.ipAddress,
          isTrusted: false,
        });
    }
  }

  async logout(user: UserEntity, userLogoutDto: UserLogoutDto) {
    const session = await this.userSessionService.find(
      userLogoutDto.deviceId,
      user.id,
    );
    if (!session) {
      throw new NotFoundException('Phiên đăng nhập không tồn tại!');
    }
    await this.cacheService.set(
      `Blocked_${session.uid}`,
      true,
      this.configService.authConfig.refreshExpirationTime * 1000,
    );
    session.expired = new Date();
    session.refreshJwt = '';
    session.uid = '';
    await this.userSessionService.save(session);
  }

  async resend(userResendDto: UserResendDto) {
    const user = await this.userService.findByEmail(userResendDto.email);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    const otp = await this.otpService.generateEmailOtp(
      userResendDto.deviceId,
      user.email,
    );

    await this.emailQueueService.add(
      TFA_VERIFY_PROCESS,
      {
        otp,
        email: user.email,
        requestDate: moment().format('DD/MM/YYYY HH:mm'),
        deviceName: userResendDto.deviceName,
      },
      { removeOnComplete: true },
    );
  }

  async forgotPassword(userForgotDto: UserForgotDto) {
    const user = await this.userService.findByEmail(userForgotDto.email);
    const expireTime = this.configService.authConfig.forgotPassExpirationTime;
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    const code = await this.jwtService.signAsync(
      {
        email: userForgotDto.email,
        type: TokenType.FORGOT_PASSWORD,
      },
      { expiresIn: expireTime },
    );

    // Save this code to cache
    await this.cacheService.set(`Forgot_Pass_${code}`, true, expireTime * 1000);

    await this.emailQueueService.add(RESET_PASS_PROCESS, {
      url: `${this.configService.webHost}/public/reset-password?code=${code}&email=${userForgotDto.email}`,
      email: userForgotDto.email,
      requestDate: moment().format('DD/MM/YYYY HH:mm'),
      deviceName: userForgotDto.deviceName,
    });
  }

  async resetPassword(userResetDto: UserResetDto) {
    const verify = await this.jwtService.verifyAsync(userResetDto.code);
    const cache = await this.cacheService.get(
      `Forgot_Pass_${userResetDto.code}`,
    );
    if (
      !cache ||
      !verify ||
      verify.email !== userResetDto.email ||
      verify.expired
    ) {
      throw new ForbiddenException(null, {
        description:
          'Đổi mật khẩu không thành công! Liên kết hết hạn hoặc đã được sử dụng.',
      });
    }
    const user = await this.userService.findByEmail(userResetDto.email);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    await this.userService.updatePassword(user.id, userResetDto.password);
    await this.cacheService.del(`Forgot_Pass_${userResetDto.code}`);
  }

  generateOtpToken(email: string): OtpTokenPayloadDto {
    return this.otpService.generateTokenOtp(email);
  }

  async twoFactoryVerify(
    userVerifyDto: UserVerifyDto,
  ): Promise<TokenPayloadDto> {
    const user = await this.userService.findByEmail(userVerifyDto.email);
    if (!user || user.twoFactory === TwoFactoryMethod.DISABLED) {
      throw new NotFoundException('Tài khoản không tồn tại!');
    }

    switch (user.twoFactory) {
      case TwoFactoryMethod.EMAIL:
        if (
          !(await this.otpService.verifyEmailOtp({
            deviceId: userVerifyDto.deviceId,
            userEmail: user.email,
            otp: userVerifyDto.otp,
          }))
        ) {
          throw new OtpInvalidException();
        }
        break;
      case TwoFactoryMethod.OTP:
        if (
          !(await this.otpService.verifyTokenOtp({
            deviceId: userVerifyDto.deviceId,
            userEmail: user.email,
            token: userVerifyDto.otp,
            secret: userVerifyDto.secret || user.optSecret,
          }))
        ) {
          throw new OtpInvalidException();
        }
        break;
    }

    if (!isEmpty(userVerifyDto.secret)) {
      await this.userService.updateSecret(user.id, userVerifyDto.secret);
    }

    return this.getTokenAndSaveSession(user, {
      deviceId: userVerifyDto.deviceId,
      deviceName: userVerifyDto.deviceName,
      ipAddress: userVerifyDto.ipAddress,
      isTrusted: userVerifyDto.isTrusted,
    });
  }

  async refreshToken(userRefreshDto: UserRefreshDto): Promise<TokenPayloadDto> {
    if (!userRefreshDto.refreshToken) {
      throw new JwtInvalidException();
    }
    const payload = this.jwtService.verify(userRefreshDto.refreshToken);
    const session = await this.userSessionService.find(
      payload.deviceId,
      payload.userId,
    );
    if (!session || !session.refreshJwt || moment(session.expired).isBefore()) {
      throw new JwtInvalidException();
    }
    const isValidToken = await validateHash(
      reverseString(userRefreshDto.refreshToken),
      session.refreshJwt,
    );
    if (!isValidToken) {
      throw new JwtInvalidException();
    }
    const uid = v4();
    const { expiresIn, accessToken, refreshToken } = await this.generateToken(
      payload.userId,
      payload.deviceId,
      uid,
    );
    session.uid = uid;
    session.refreshJwt = refreshToken;
    session.expired = expiresIn;
    this.userSessionService.save(session).then();
    return new TokenPayloadDto({
      expiresIn,
      accessToken,
      refreshToken,
    });
  }

  private async getTokenAndSaveSession(
    user: UserEntity,
    device: {
      deviceName: string;
      deviceId: string;
      ipAddress: string;
      isTrusted: boolean;
    },
  ) {
    const uid = v4();
    const token = await this.generateToken(user.id, device.deviceId, uid);
    await this.userSessionService.save({
      ...device,
      uid,
      refreshJwt: token.refreshToken,
      expired: token.expiresIn,
      userId: user.id,
    });
    await this.userService.updateLastLogin(user.id);
    return new TokenPayloadDto({
      ...token,
      twoFactoryMethod: user.twoFactory,
    });
  }

  private async generateToken(userId: number, deviceId: string, uid: string) {
    return {
      expiresIn: moment()
        .add(this.configService.authConfig.refreshExpirationTime, 'seconds')
        .toDate(),
      accessToken: await this.jwtService.signAsync(
        {
          uid,
          userId,
          deviceId,
          type: TokenType.ACCESS_TOKEN,
        },
        { expiresIn: this.configService.authConfig.jwtExpirationTime },
      ),
      refreshToken: await this.jwtService.signAsync(
        {
          uid,
          userId,
          deviceId,
          type: TokenType.REFRESH_TOKEN,
        },
        { expiresIn: this.configService.authConfig.refreshExpirationTime },
      ),
    };
  }
}
