import type { MailPayload, MailProvider } from './mail.type';

import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { QueueProcessor } from '../queue/queue.type';
import { QueueName } from '../queue/queues.definitions';
import { MAIL_PROVIDER } from './mail.constants';

@Injectable()
export class MailProcessor extends QueueProcessor(QueueName.MAILS) {
  constructor(@Inject(MAIL_PROVIDER) private readonly mailProvider: MailProvider) {
    super({ concurrency: 5 });
  }

  async process(job: Job<MailPayload>) {
    await this.mailProvider.send(job.data);
  }
}
