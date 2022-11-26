import { AnyApiFactory, createApiFactory } from '@wishlist/common-front';
import { buildApi, wishlistApiRef } from './wishlist.api';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: wishlistApiRef,
    factory: () => buildApi(),
  }),
];
