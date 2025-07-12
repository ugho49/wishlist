import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistController } from './controllers/wishlist.controller'
import { WishlistEntity } from './wishlist.entity'
import { WishlistRepository } from './wishlist.repository'
import { WishlistService } from './wishlist.service'

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity]), EventModule],
  controllers: [WishlistController, WishlistAdminController],
  providers: [WishlistService, WishlistRepository],
  exports: [WishlistRepository],
})
export class WishlistModule {}
