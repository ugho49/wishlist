import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistController } from './controllers/wishlist.controller'
import { LegacyWishlistService } from './legacy-wishlist.service'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [LegacyWishlistService, ...handlers],
})
export class WishlistModule {}
