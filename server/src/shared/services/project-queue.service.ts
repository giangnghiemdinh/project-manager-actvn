import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { PROJECT_QUEUE } from '../../common/constants';
import { Queue } from 'bull';

@Injectable()
export class ProjectQueueService {
  constructor(
    @InjectQueue(PROJECT_QUEUE)
    private readonly driverQueue: Queue,
  ) {}

  add(
    process: string,
    data: unknown,
    options: any = { removeOnComplete: true },
  ) {
    return this.driverQueue.add(process, data, options);
  }
}
