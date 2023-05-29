import { Module } from '@nestjs/common';
import { ManagerStaffController } from './manager-staff.controller';
import { ManagerStaffService } from './manager-staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerStaffEntity } from './models';
import { SemesterModule } from '../semester/semester.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    SemesterModule,
    TypeOrmModule.forFeature([ManagerStaffEntity]),
  ],
  controllers: [ManagerStaffController],
  providers: [ManagerStaffService],
})
export class ManagerStaffModule {}
