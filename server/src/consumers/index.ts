import { EmailConsumer } from './email.consumer';
import { DriverConsumer } from './driver.consumer';

export * from './email.consumer';
export * from './driver.consumer';

export const consumers = [EmailConsumer, DriverConsumer];
