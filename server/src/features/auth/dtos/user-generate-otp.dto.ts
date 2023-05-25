import { StringProperty } from '../../../common/decorators';

export class UserGenerateOtpDto {
  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;
}
