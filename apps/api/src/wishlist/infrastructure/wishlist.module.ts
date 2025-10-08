import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistController } from './controllers/wishlist.controller'
import { WishlistResolver } from './resolvers/wishlist.resolver'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [...handlers, WishlistResolver],
})
export class WishlistModule {}
