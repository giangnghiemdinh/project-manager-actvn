import { StringProperty } from '../../../common/decorators';

export class UserLogoutRequestDto {
  @StringProperty('ID thiết bị', {
    required: true,
  })
  readonly deviceId: string;
}
