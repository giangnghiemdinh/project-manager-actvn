import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty } from '@nestjs/swagger';
import { UserSessionEntity } from '../models';

export class UserSessionDto extends AbstractDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  isTrusted: boolean;

  @ApiProperty()
  uid: string;

  @ApiProperty()
  refreshJwt: string;

  @ApiProperty()
  expired: Date;

  @ApiProperty()
  userId: number;

  constructor(userSession: UserSessionEntity) {
    super(userSession);
    this.deviceId = userSession.deviceId;
    this.deviceName = userSession.deviceName;
    this.ipAddress = userSession.ipAddress;
    this.uid = userSession.uid;
    this.refreshJwt = userSession.refreshJwt;
    this.isTrusted = userSession.isTrusted;
    this.expired = userSession.expired;
    this.userId = userSession.userId;
  }
}
