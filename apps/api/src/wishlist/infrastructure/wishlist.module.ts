import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistController } from './controllers/wishlist.controller'
import { WishlistAdminController } from './controllers/wishlist-admin.controller'
import { WishlistFieldResolver } from './resolvers/wishlist.field-resolver'
import { WishlistResolver } from './resolvers/wishlist.resolver'
import { WishlistDataLoaderFactory } from './wishlist.dataloader'

@Module({
  controllers: [WishlistController, WishlistAdminController],
  providers: [...handlers, WishlistResolver, WishlistFieldResolver, WishlistDataLoaderFactory],
  exports: [WishlistDataLoaderFactory],
})
export class WishlistModule {}
