import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { EMAIL_QUEUE } from '../../common/constants';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  add(process: string, data: unknown, options = { removeOnComplete: true }) {
    return this.emailQueue.add(process, data, options);
  }
}
