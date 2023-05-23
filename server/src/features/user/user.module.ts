import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserEventEntity, UserSessionEntity } from './models';
import { UserEventService, UserService, UserSessionService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserEventEntity, UserSessionEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, UserEventService, UserSessionService],
  exports: [UserService, UserEventService, UserSessionService],
})
export class UserModule {}
