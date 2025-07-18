import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistController } from './controllers/wishlist.controller'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [...handlers],
})
export class WishlistModule {}
