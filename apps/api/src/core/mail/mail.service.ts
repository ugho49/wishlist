import { Injectable, Logger } from '@nestjs/common';

import { QueueService } from '../queue/queue.service';
import { QueueName } from '../queue/queues.definitions';
import { type MailPayload } from './mail.type';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly queueService: QueueService) {}

  async sendMail(param: MailPayload) {
    this.logger.log(`Publishing to queue ${QueueName.MAILS} in order to be processed`, { param });

    await this.queueService.addJob(QueueName.MAILS, 'send-mail', param);
  }
}
