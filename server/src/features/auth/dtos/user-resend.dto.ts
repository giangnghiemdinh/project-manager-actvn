import { StringProperty } from '../../../common/decorators';

export class UserResendRequestDto {
  @StringProperty('ID thiết bị', {
    required: true,
  })
  readonly deviceId: string;

  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;

  deviceName: string;
}
