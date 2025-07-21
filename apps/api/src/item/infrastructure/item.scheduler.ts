import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Cron } from '@nestjs/schedule'

import { NotifyNewItemsCommand } from '../domain'

@Injectable()
export class ItemScheduler {
  constructor(private readonly commandBus: CommandBus) {}

  // Fire at 10:15 AM every day
  @Cron('0 15 10 * * *')
  async sendNewItemNotification() {
    await this.commandBus.execute(new NotifyNewItemsCommand())
  }
}
