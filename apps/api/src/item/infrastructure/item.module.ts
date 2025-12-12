import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { ItemController } from './item.controller'
import { ItemResolver } from './item.resolver'
import { ItemScheduler } from './item.scheduler'

@Module({
  controllers: [ItemController],
  providers: [ItemScheduler, ...handlers, ItemResolver],
})
export class ItemModule {}
