import { Module } from '@nestjs/common';
import { ManagerStaffController } from './manager-staff.controller';
import { ManagerStaffService } from './manager-staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerStaffEntity } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([ManagerStaffEntity])],
  controllers: [ManagerStaffController],
  providers: [ManagerStaffService],
})
export class ManagerStaffModule {}
