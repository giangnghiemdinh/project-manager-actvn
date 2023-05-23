import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressEntity } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressEntity])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
