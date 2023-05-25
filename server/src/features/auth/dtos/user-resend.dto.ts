import { StringProperty } from '../../../common/decorators';

export class UserResendDto {
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
