import { AnyApiFactory, createApiFactory } from '@wishlist/common-front';
import { WishlistApiImpl, wishlistApiRef } from './wishlist.api';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: wishlistApiRef,
    factory: () => new WishlistApiImpl(),
  }),
];
