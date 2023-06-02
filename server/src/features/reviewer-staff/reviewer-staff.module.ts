import { Module } from '@nestjs/common';
import { ReviewerStaffController } from './reviewer-staff.controller';
import { ReviewerStaffService } from './reviewer-staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewerStaffEntity } from './models';
import { ProjectModule } from '../project/project.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    SemesterModule,
    ProjectModule,
    TypeOrmModule.forFeature([ReviewerStaffEntity]),
  ],
  controllers: [ReviewerStaffController],
  providers: [ReviewerStaffService],
  exports: [ReviewerStaffService],
})
export class ReviewerStaffModule {}
