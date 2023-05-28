import { Global, Module } from '@nestjs/common';
import {
  ApiConfigService,
  CacheService,
  DriverService,
  EmailQueueService,
  OtpService,
  ProjectQueueService,
} from './services';
import { BullModule } from '@nestjs/bull';
import { EMAIL_QUEUE, PROJECT_QUEUE } from '../common/constants';

const providers = [
  ApiConfigService,
  EmailQueueService,
  DriverService,
  OtpService,
  ProjectQueueService,
  CacheService,
];

@Global()
@Module({
  providers,
  imports: [
    BullModule.registerQueue({ name: EMAIL_QUEUE }, { name: PROJECT_QUEUE }),
  ],
  exports: [...providers],
})
export class SharedModule {}
