import { StringProperty } from '../../../common/decorators';

export class UserLogoutDto {
  @StringProperty('ID thiết bị', {
    required: true,
  })
  readonly deviceId: string;
}
