import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistFieldResolver } from './resolvers/wishlist.field-resolver';
import { WishlistResolver } from './resolvers/wishlist.resolver';
import { WishlistAdminResolver } from './resolvers/wishlist-admin.resolver';
import { WishlistMutationResolver } from './resolvers/wishlist-mutation.resolver';
import { WishlistDataLoaderFactory } from './wishlist.dataloader';

@Module({
  controllers: [WishlistController],
  providers: [
    ...handlers,
    WishlistResolver,
    WishlistMutationResolver,
    WishlistAdminResolver,
    WishlistFieldResolver,
    WishlistDataLoaderFactory,
  ],
  exports: [WishlistDataLoaderFactory],
})
export class WishlistModule {}
