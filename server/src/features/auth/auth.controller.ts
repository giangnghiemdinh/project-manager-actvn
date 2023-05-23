import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth, AuthUser, ReqExtra } from '../../common/decorators';
import {
  TokenPayloadDto,
  UserForgotDto,
  UserLoginDto,
  UserRefreshDto,
  UserResendDto,
  UserResetDto,
  UserVerifyDto,
} from './dtos';
import { UserGenerateOtpDto } from './dtos/user-generate-otp.dto';
import { OtpTokenPayloadDto } from './dtos/otp-token-payload.dto';
import { UserEntity } from '../user/models';
import { UserLogoutDto } from './dtos/user-logout.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
@ApiTags('Bảo mật')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenPayloadDto,
  })
  async login(
    @Body() userLoginDto: UserLoginDto,
    @ReqExtra() reqExtra: { ip: string; deviceName: string },
  ): Promise<TokenPayloadDto> {
    userLoginDto.deviceName = reqExtra.deviceName;
    userLoginDto.ipAddress = reqExtra.ip;
    return this.authService.login(userLoginDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenPayloadDto,
  })
  async verify(
    @Body() userVerifyDto: UserVerifyDto,
    @ReqExtra() reqExtra: { ip: string; deviceName: string },
  ): Promise<TokenPayloadDto> {
    userVerifyDto.deviceName = reqExtra.deviceName;
    userVerifyDto.ipAddress = reqExtra.ip;
    return this.authService.twoFactoryVerify(userVerifyDto);
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async resend(
    @Body() userResendDto: UserResendDto,
    @ReqExtra() reqExtra: { deviceName: string },
  ): Promise<void> {
    userResendDto.deviceName = reqExtra.deviceName;
    return this.authService.resend(userResendDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenPayloadDto,
  })
  @SkipThrottle()
  async refreshToken(
    @Body() userRefreshDto: UserRefreshDto,
  ): Promise<TokenPayloadDto> {
    return this.authService.refreshToken(userRefreshDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async forgotPassword(
    @Body() userForgotDto: UserForgotDto,
    @ReqExtra() reqExtra: { deviceName: string },
  ): Promise<void> {
    userForgotDto.deviceName = reqExtra.deviceName;
    return this.authService.forgotPassword(userForgotDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async resetPassword(@Body() userResetDto: UserResetDto): Promise<void> {
    return this.authService.resetPassword(userResetDto);
  }

  @Get('generate-otp/:email')
  async generateOtpToken(
    @Param() param: UserGenerateOtpDto,
  ): Promise<OtpTokenPayloadDto> {
    return this.authService.generateOtpToken(param.email);
  }

  @Post('logout')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() userLogoutDto: UserLogoutDto,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    await this.authService.logout(user, userLogoutDto);
  }
}
