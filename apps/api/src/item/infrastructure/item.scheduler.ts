import { Injectable, OnModuleInit } from '@nestjs/common'
import { QueueName, QueueService } from '@wishlist/api/core'

import { ItemNotificationJobName } from './item.type'

@Injectable()
export class ItemScheduler implements OnModuleInit {
  constructor(private readonly queueService: QueueService) {}

  async onModuleInit() {
    await this.queueService.scheduleBullMQJob({
      queueName: QueueName.ITEMS_NOTIFICATIONS,
      jobName: ItemNotificationJobName.DAILY_NEW_ITEMS_NOTIFIER,
      data: {},
      // Fire at 10:15 AM every day
      repeatPattern: '15 10 * * *',
    })
  }
}
