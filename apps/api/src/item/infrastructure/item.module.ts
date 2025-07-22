import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { ItemController } from './item.controller'
import { ItemScheduler } from './item.scheduler'

@Module({
  controllers: [ItemController],
  providers: [ItemScheduler, ...handlers],
})
export class ItemModule {}
