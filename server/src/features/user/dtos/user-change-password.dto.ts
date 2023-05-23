import { StringProperty } from '../../../common/decorators';

export class UserChangePasswordRequestDto {
  @StringProperty('Mật khẩu cũ', {
    required: true,
    isPassword: true,
  })
  readonly oldPassword: string;

  @StringProperty('Mật khẩu mới', {
    required: true,
    isPassword: true,
  })
  readonly newPassword: string;
}
