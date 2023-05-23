import { Module } from '@nestjs/common';
import { StatisticalController } from './statistical.controller';
import { StatisticalService } from './statistical.service';

@Module({
  controllers: [StatisticalController],
  providers: [StatisticalService]
})
export class StatisticalModule {}
