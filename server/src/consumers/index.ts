import { EmailConsumer } from './email.consumer';
import { ProjectConsumer } from './project.consumer';
import { EventConsumer } from './event.consumer';

export * from './email.consumer';
export * from './project.consumer';
export * from './event.consumer';

export const consumers = [EmailConsumer, ProjectConsumer, EventConsumer];
