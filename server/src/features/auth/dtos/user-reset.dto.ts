import { StringProperty } from '../../../common/decorators';

export class UserResetDto {
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

  @StringProperty('Mã bảo mật', {
    required: true,
  })
  readonly code: string;
}
