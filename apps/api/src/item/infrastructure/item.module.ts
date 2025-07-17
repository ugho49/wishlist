import { Module } from '@nestjs/common'

import { ItemController } from './item.controller'
import { ItemMailer } from './item.mailer'
import { ItemScheduler } from './item.scheduler'
import { ItemService } from './item.service'
import { ScrapperService } from './scrapper.service'

@Module({
  controllers: [ItemController],
  providers: [ItemService, ItemScheduler, ItemMailer, ScrapperService],
})
export class ItemModule {}
