import { Injectable, type Lazy } from '@znight/core';
import { getLogger } from '@znight/observability';

import { QueueService } from '../queue/queue.service';
import { QueueName } from '../queue/queues.definitions';
import { type MailPayload } from './mail.type';

@Injectable()
export class MailService {
  private readonly logger = getLogger(MailService.name);

  // Lazy: QueueService -> processors -> use cases -> MailService
  constructor(private readonly queueService: Lazy<QueueService>) {}

  async sendMail(param: MailPayload) {
    this.logger.info(`Publishing to queue ${QueueName.MAILS} in order to be processed`, { param });

    await this.queueService.get().addJob(QueueName.MAILS, 'send-mail', param);
  }
}
