import { Global, Module } from '@nestjs/common';
import {
  ApiConfigService,
  CacheService,
  DriverService,
  OtpService,
  QueueService,
} from './services';
import { BullModule } from '@nestjs/bull';
import { EMAIL_QUEUE, EVENT_QUEUE, PROJECT_QUEUE } from '../common/constants';

const providers = [
  ApiConfigService,
  DriverService,
  OtpService,
  CacheService,
  QueueService,
];

@Global()
@Module({
  providers,
  imports: [
    BullModule.registerQueue(
      { name: EMAIL_QUEUE },
      { name: PROJECT_QUEUE },
      { name: EVENT_QUEUE },
    ),
  ],
  exports: [...providers],
})
export class SharedModule {}
