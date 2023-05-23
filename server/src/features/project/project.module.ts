import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './models';
import { ProjectProgressEntity } from './models/project-progress.entity';
import { UserModule } from '../user/user.module';
import { StudentModule } from '../student/student.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    UserModule,
    StudentModule,
    SemesterModule,
    TypeOrmModule.forFeature([ProjectEntity, ProjectProgressEntity]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
