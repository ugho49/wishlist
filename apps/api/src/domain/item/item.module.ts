import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module.js'
import { WishlistModule } from '../wishlist/wishlist.module.js'
import { ItemController } from './item.controller.js'
import { ItemEntity } from './item.entity.js'
import { ItemMailer } from './item.mailer.js'
import { ItemRepository } from './item.repository.js'
import { ItemScheduler } from './item.scheduler.js'
import { ItemService } from './item.service.js'
import { ScrapperService } from './scrapper.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity]), WishlistModule, UserModule],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, ItemScheduler, ItemMailer, ScrapperService],
})
export class ItemModule {}
