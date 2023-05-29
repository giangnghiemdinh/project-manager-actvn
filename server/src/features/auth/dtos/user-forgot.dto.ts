import { StringProperty } from '../../../common/decorators';

export class UserForgotRequestDto {
  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;

  deviceName: string;
}
