import { EmailConsumer } from './email.consumer';
import { ProjectConsumer } from './project.consumer';

export * from './email.consumer';
export * from './project.consumer';

export const consumers = [EmailConsumer, ProjectConsumer];
