import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth, AuthUser, ReqExtra } from '../../common/decorators';
import { UserEntity } from '../user/models';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  TokenResponseDto,
  UserForgotRequestDto,
  UserGenerateOtpRequestDto,
  UserLoginRequestDto,
  UserLogoutRequestDto,
  UserRefreshRequestDto,
  UserResendRequestDto,
  UserResetRequestDto,
  UserVerifyRequestDto,
} from './dtos';
import { Response } from 'express';

@Controller('auth')
@ApiTags('Bảo mật')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenResponseDto,
  })
  async login(
    @Body() userLoginDto: UserLoginRequestDto,
    @ReqExtra() reqExtra: { ip: string; deviceName: string },
  ): Promise<TokenResponseDto> {
    userLoginDto.deviceName = reqExtra.deviceName;
    userLoginDto.ipAddress = reqExtra.ip;
    return this.authService.login(userLoginDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenResponseDto,
  })
  async verify(
    @Body() userVerifyDto: UserVerifyRequestDto,
    @ReqExtra() reqExtra: { ip: string; deviceName: string },
  ): Promise<TokenResponseDto> {
    userVerifyDto.deviceName = reqExtra.deviceName;
    userVerifyDto.ipAddress = reqExtra.ip;
    return this.authService.twoFactoryVerify(userVerifyDto);
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @Throttle(1, 40)
  async resend(
    @Body() userResendDto: UserResendRequestDto,
    @ReqExtra() reqExtra: { deviceName: string },
  ): Promise<void> {
    userResendDto.deviceName = reqExtra.deviceName;
    return this.authService.resend(userResendDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenResponseDto,
  })
  @SkipThrottle()
  async refreshToken(
    @Body() userRefreshDto: UserRefreshRequestDto,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshToken(userRefreshDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async forgotPassword(
    @Body() userForgotDto: UserForgotRequestDto,
    @ReqExtra() reqExtra: { deviceName: string },
  ): Promise<void> {
    userForgotDto.deviceName = reqExtra.deviceName;
    return this.authService.forgotPassword(userForgotDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async resetPassword(
    @Body() userResetDto: UserResetRequestDto,
  ): Promise<void> {
    return this.authService.resetPassword(userResetDto);
  }

  @Get('generate-otp/:email')
  @Throttle(1, 40)
  async generateOtpToken(
    @Param() param: UserGenerateOtpRequestDto,
    @Res() response: Response,
  ): Promise<StreamableFile> {
    return this.authService.generateOtpToken(param.email, response);
  }

  @Post('logout')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() userLogoutDto: UserLogoutRequestDto,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    await this.authService.logout(user, userLogoutDto);
  }
}
