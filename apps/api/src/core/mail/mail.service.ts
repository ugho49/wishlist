import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bullmq'

import { QueueName } from '../queue'
import { MailPayload } from './mail.type'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(
    @InjectQueue(QueueName.MAILS)
    private readonly queue: Queue,
  ) {}

  async sendMail(param: {
    to: string | string[]
    subject: string
    template: string
    context?: Record<string, unknown>
  }) {
    this.logger.log(`Publishing to queue ${QueueName.MAILS} in order to be processed`, { param })

    await this.queue.add(
      'send-mail',
      {
        to: param.to,
        subject: param.subject,
        template: param.template,
        context: param.context,
      } satisfies MailPayload,
      {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    )
  }
}
