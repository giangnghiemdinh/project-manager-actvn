import { StringProperty } from '../../../common/decorators';

export class UserForgotDto {
  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;

  deviceName: string;
}
