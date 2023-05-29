import { StringProperty } from '../../../common/decorators';

export class UserResetRequestDto {
  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;

  @StringProperty('Mật khẩu', {
    required: true,
    password: true,
  })
  readonly password: string;

  @StringProperty('Mã bảo mật', {
    required: true,
  })
  readonly code: string;
}
