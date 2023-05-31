import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProjectService } from '../features/project/project.service';
import { DriverService } from '../shared/services';

@Injectable()
export class ProgressTaskService {
  private readonly logger = new Logger(ProgressTaskService.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly googleDriverService: DriverService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerCronJob() {}
}
