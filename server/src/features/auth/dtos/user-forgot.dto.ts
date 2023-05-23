import { StringProperty } from '../../../common/decorators';

export class UserForgotDto {
  @StringProperty('Email', {
    required: true,
    isEmail: true,
  })
  readonly email: string;

  deviceName: string;
}
