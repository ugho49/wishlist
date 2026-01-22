import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { ItemController } from './item.controller'
import { ItemResolver } from './item.resolver'
import { ItemScheduler } from './item.scheduler'
import { ItemNotificationsProcessor } from './item-notifications.processor'

@Module({
  controllers: [ItemController],
  providers: [ItemScheduler, ItemNotificationsProcessor, ItemResolver, ...handlers],
})
export class ItemModule {}
