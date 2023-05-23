import { StringProperty } from '../../../common/decorators';

export class UserRefreshDto {
  @StringProperty('Refresh Token', {
    required: true,
  })
  readonly refreshToken: string;
}
