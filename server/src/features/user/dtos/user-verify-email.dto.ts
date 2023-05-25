import { StringProperty } from '../../../common/decorators';

export class UserVerifyEmailRequestDto {
  @StringProperty('Email', {
    required: true,
    email: true,
    toLowerCase: true,
    trim: true,
  })
  readonly email: string;

  deviceName: string;
}
