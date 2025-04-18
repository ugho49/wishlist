import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module'
import { WishlistModule } from '../wishlist/wishlist.module'
import { ItemController } from './item.controller'
import { ItemEntity } from './item.entity'
import { ItemMailer } from './item.mailer'
import { ItemRepository } from './item.repository'
import { ItemScheduler } from './item.scheduler'
import { ItemService } from './item.service'
import { ScrapperService } from './scrapper.service'

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity]), WishlistModule, UserModule],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, ItemScheduler, ItemMailer, ScrapperService],
})
export class ItemModule {}
