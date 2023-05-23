import type {
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { UserEntity } from '../features/user/models';
import { generateHash } from '../common/utilities';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>) {
    if (event.entity) {
      event.entity.password = await generateHash(
        event.entity.password || '123456',
      );
    }
  }

  async afterInsert(event: InsertEvent<UserEntity>) {
    // TODO: send email password
  }

  beforeUpdate(event: UpdateEvent<UserEntity>): void {}
}
