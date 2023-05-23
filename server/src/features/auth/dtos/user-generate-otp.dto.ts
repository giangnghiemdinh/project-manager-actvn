import { StringProperty } from '../../../common/decorators';

export class UserGenerateOtpDto {
  @StringProperty('Email', {
    required: true,
    isEmail: true,
  })
  readonly email: string;
}
