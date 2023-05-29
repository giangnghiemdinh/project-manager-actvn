import { StringProperty } from '../../../common/decorators';

export class UserRefreshRequestDto {
  @StringProperty('Refresh Token', {
    required: true,
  })
  readonly refreshToken: string;
}
