import type { Job, RepeatOptions } from 'bullmq';

import { QueueName, type QueueNamePayloadMap } from './queues.definitions';

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

export function QueueProcessor<T extends QueueName>(queueName: T) {
  abstract class QueueProcessorImpl extends QueueProcessorBase {
    override readonly queueName = queueName;
    abstract override process(job: Job<QueueNamePayloadMap[T]>): Promise<void>;
  }
  return QueueProcessorImpl;
}
