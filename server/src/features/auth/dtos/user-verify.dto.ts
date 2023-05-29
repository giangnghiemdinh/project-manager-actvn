import { ApiPropertyOptional } from '@nestjs/swagger';
import { BooleanProperty, StringProperty } from '../../../common/decorators';

export class UserVerifyRequestDto {
  @StringProperty('ID thiết bị', {
    required: true,
  })
  readonly deviceId: string;

  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;

  @StringProperty('Mã xác thực', {
    required: true,
    minLength: 6,
    maxLength: 6,
  })
  readonly otp: string;

  @StringProperty('Mã ứng dụng')
  readonly secret?: string;

  @BooleanProperty('Lưu thiết bị')
  readonly isTrusted: boolean;

  @ApiPropertyOptional()
  deviceName: string;

  @ApiPropertyOptional()
  ipAddress: string;
}
