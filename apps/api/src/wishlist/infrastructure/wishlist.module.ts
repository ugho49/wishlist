import { Module } from '@nestjs/common'

import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistController } from './controllers/wishlist.controller'
import { WishlistService } from './wishlist.service'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [WishlistService],
})
export class WishlistModule {}
