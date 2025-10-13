import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistController } from './controllers/wishlist.controller'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [...handlers],
})
export class WishlistModule {}
