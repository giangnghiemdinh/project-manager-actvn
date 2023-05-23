import { Global, Module } from '@nestjs/common';
import {
  ApiConfigService,
  CacheService,
  DriverQueueService,
  DriverService,
  EmailQueueService,
  OtpService,
} from './services';
import { BullModule } from '@nestjs/bull';
import { DRIVER_QUEUE, EMAIL_QUEUE } from '../common/constants';

const providers = [
  ApiConfigService,
  EmailQueueService,
  DriverService,
  OtpService,
  DriverQueueService,
  CacheService,
];

@Global()
@Module({
  providers,
  imports: [
    BullModule.registerQueue({ name: EMAIL_QUEUE }, { name: DRIVER_QUEUE }),
  ],
  exports: [...providers],
})
export class SharedModule {}
