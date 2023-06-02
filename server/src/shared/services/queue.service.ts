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

  addEvent(process: string, data: unknown, delay?: number) {
    return this.eventQueue.add(process, data, {
      delay,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'fixed', delay: 3000 },
      removeOnFail: true,
    });
  }

  addMail(process: string, data: unknown, delay?: number) {
    return this.emailQueue.add(process, data, {
      delay,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'fixed', delay: 3000 },
      removeOnFail: true,
    });
  }

  addProject(process: string, data: unknown, delay?: number) {
    return this.driverQueue.add(process, data, {
      delay,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'fixed', delay: 3000 },
      removeOnFail: true,
    });
  }
}
