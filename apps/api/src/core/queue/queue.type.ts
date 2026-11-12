import type { Job, RepeatOptions } from 'bullmq';
import type { QueueName } from './queues.definitions';

export type QueueProcessorOptions = {
  concurrency: number;
  repeat?: Omit<RepeatOptions, 'key'>;
};

const defaultOptions: QueueProcessorOptions = { concurrency: 1 };

export abstract class QueueProcessorBase {
  public readonly options: QueueProcessorOptions;

  abstract readonly queueName: QueueName;
  abstract process(job: Job): Promise<void>;

  constructor(options: QueueProcessorOptions = defaultOptions) {
    this.options = { ...defaultOptions, ...options };
  }
}
