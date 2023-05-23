import { Module } from '@nestjs/common';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemesterEntity } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([SemesterEntity])],
  controllers: [SemesterController],
  providers: [SemesterService],
  exports: [SemesterService],
})
export class SemesterModule {}
