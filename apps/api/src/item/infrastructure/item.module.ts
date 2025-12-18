import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { ItemController } from './item.controller'
import { ItemScheduler } from './item.scheduler'
import { ItemNotificationsProcessor } from './item-notifications.processor'

@Module({
  controllers: [ItemController],
  providers: [ItemScheduler, ItemNotificationsProcessor, ...handlers],
})
export class ItemModule {}
