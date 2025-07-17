import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { ItemController } from './item.controller'
import { ItemMailer } from './item.mailer'
import { ItemScheduler } from './item.scheduler'

@Module({
  controllers: [ItemController],
  providers: [ItemScheduler, ItemMailer, ...handlers],
})
export class ItemModule {}
