import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistController } from './controllers/wishlist.controller'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistDataLoaderFactory } from './wishlist.dataloader'
import { WishlistResolver } from './wishlist.resolver'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [...handlers, WishlistResolver, WishlistDataLoaderFactory],
  exports: [WishlistDataLoaderFactory],
})
export class WishlistModule {}
