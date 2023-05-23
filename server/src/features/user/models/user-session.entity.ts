import { AbstractEntity } from '../../../common/abstracts';
import { UserEntity } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { UserSessionDto } from '../dtos';

@Entity({ name: 'user_sessions' })
@UseDto(UserSessionDto)
export class UserSessionEntity extends AbstractEntity<UserSessionDto> {
  @Column()
  deviceId: string;

  @Column()
  deviceName: string;

  @Column()
  ipAddress: string;

  @Column()
  uid: string;

  @Column()
  refreshJwt: string;

  @Column({ type: 'timestamp' })
  expired: Date;

  @Column({ default: false })
  isTrusted: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
