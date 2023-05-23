import { ApiPropertyOptional } from '@nestjs/swagger';
import { TwoFactoryMethod } from '../../../common/constants';

export class TokenPayloadDto {
  @ApiPropertyOptional()
  twoFactoryMethod?: TwoFactoryMethod;

  @ApiPropertyOptional()
  requiredOtpToken?: boolean;

  @ApiPropertyOptional()
  expiresIn?: Date;

  @ApiPropertyOptional()
  accessToken?: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  constructor(data: {
    expiresIn?: Date;
    accessToken?: string;
    refreshToken?: string;
    requiredOtpToken?: boolean;
    twoFactoryMethod?: TwoFactoryMethod;
  }) {
    this.expiresIn = data.expiresIn;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.requiredOtpToken = data.requiredOtpToken;
    this.twoFactoryMethod = data.twoFactoryMethod;
  }
}
