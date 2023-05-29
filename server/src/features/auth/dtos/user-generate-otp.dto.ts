import { StringProperty } from '../../../common/decorators';

export class UserGenerateOtpRequestDto {
  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;
}
