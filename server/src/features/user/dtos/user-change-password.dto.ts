import { StringProperty } from '../../../common/decorators';

export class UserChangePasswordRequestDto {
  @StringProperty('Mật khẩu cũ', {
    required: true,
    password: true,
  })
  readonly oldPassword: string;

  @StringProperty('Mật khẩu mới', {
    required: true,
    password: true,
  })
  readonly password: string;
}
