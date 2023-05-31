import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import {
  EMAIL_QUEUE,
  EVENT_QUEUE,
  PROJECT_QUEUE,
} from '../../common/constants';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(EVENT_QUEUE)
    private readonly eventQueue: Queue,

    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,

    @InjectQueue(PROJECT_QUEUE)
    private readonly driverQueue: Queue,
  ) {}

  addEvent(
    process: string,
    data: unknown,
    options: any = { removeOnComplete: true },
  ) {
    return this.eventQueue.add(process, data, options);
  }

  addMail(
    process: string,
    data: unknown,
    options: any = { removeOnComplete: true },
  ) {
    return this.emailQueue.add(process, data, options);
  }

  addProject(
    process: string,
    data: unknown,
    options: any = { removeOnComplete: true },
  ) {
    return this.driverQueue.add(process, data, options);
  }
}
