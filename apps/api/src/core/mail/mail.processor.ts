import type { MailPayload, MailProvider } from './mail.type';

import { Injectable } from '@znight/core';
import { Job } from 'bullmq';

import { QueueProcessorBase } from '../queue/queue.type';
import { QueueName } from '../queue/queues.definitions';

@Injectable()
export class MailProcessor extends QueueProcessorBase {
  readonly queueName = QueueName.MAILS;

  constructor(private readonly mailProvider: MailProvider) {
    super({ concurrency: 5 });
  }

  async process(job: Job<MailPayload>) {
    await this.mailProvider.send(job.data);
  }
}
