import { StringProperty } from '../../../common/decorators';

export class UserVerifyEmailRequestDto {
  @StringProperty('Email', {
    required: true,
    isEmail: true,
    toLowerCase: true,
    trim: true,
  })
  readonly email: string;

  deviceName: string;
}
