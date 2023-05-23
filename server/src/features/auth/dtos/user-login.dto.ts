import { StringProperty } from '../../../common/decorators';

export class UserLoginDto {
  @StringProperty('Email', {
    required: true,
  })
  readonly deviceId: string;

  @StringProperty('Email', {
    required: true,
    isEmail: true,
  })
  readonly email: string;

  @StringProperty('Mật khẩu', {
    required: true,
    isPassword: true,
  })
  readonly password: string;

  deviceName: string;

  ipAddress: string;
}
