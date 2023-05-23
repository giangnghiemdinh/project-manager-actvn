import { Module } from '@nestjs/common';
import { ExaminerCouncilController } from './examiner-council.controller';
import { ExaminerCouncilService } from './examiner-council.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExaminerCouncilEntity } from './models';
import { ExaminerCouncilUserEntity } from './models/examiner-council-user.entity';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    ProjectModule,
    TypeOrmModule.forFeature([
      ExaminerCouncilEntity,
      ExaminerCouncilUserEntity,
    ]),
  ],
  controllers: [ExaminerCouncilController],
  providers: [ExaminerCouncilService],
})
export class ExaminerCouncilModule {}
