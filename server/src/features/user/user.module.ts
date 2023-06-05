import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserEventEntity, UserSessionEntity } from './models';
import { UserEventService, UserService, UserSessionService } from './services';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity, UserEventEntity, UserSessionEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, UserEventService, UserSessionService],
  exports: [UserService, UserEventService, UserSessionService],
})
export class UserModule {}
