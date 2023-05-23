import { AbstractEntity } from '../../../common/abstracts';
import { UserEntity } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { UserEventDto } from '../dtos';

@Entity({ name: 'user_events' })
@UseDto(UserEventDto)
export class UserEventEntity extends AbstractEntity<UserEventDto> {
  @Column({ length: 1024 })
  message: string;

  @Column()
  userId: number;

  @Column({ type: 'json', nullable: true })
  params: string;

  @ManyToOne(() => UserEntity, (user) => user.events)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
