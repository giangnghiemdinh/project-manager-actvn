import { StringProperty } from '../../../common/decorators';

export class UserChangeEmailRequestDto {
  @StringProperty('Email', {
    required: true,
    isEmail: true,
    toLowerCase: true,
  })
  readonly email: string;

  @StringProperty('Mã xác thực', {
    required: true,
    minLength: 6,
    maxLength: 6,
  })
  readonly otp: string;
}
