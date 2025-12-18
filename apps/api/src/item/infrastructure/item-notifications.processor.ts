import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { QueueName, WithPinoContext } from '@wishlist/api/core'
import { Job } from 'bullmq'
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs'

import { NotifyNewItemsCommand } from '../domain'
import { ItemNotificationJobName } from './item.type'

@Processor(QueueName.ITEMS_NOTIFICATIONS, { concurrency: 1 })
export class ItemNotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(ItemNotificationsProcessor.name)

  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(ItemNotificationsProcessor.name)
    private readonly pinoLogger: PinoLogger,
  ) {
    super()
  }

  @WithPinoContext()
  async process(job: Job<void>): Promise<void> {
    this.pinoLogger.assign({ job: { id: job.id, name: job.name, queueName: job.queueName, data: job.data } })
    this.logger.log('Processing item notifications job ...')

    switch (job.name) {
      case ItemNotificationJobName.DAILY_NEW_ITEMS_NOTIFIER:
        await this.commandBus.execute(new NotifyNewItemsCommand())
        break
      default:
        this.logger.error('Unknown job name ...')
        break
    }
  }
}
