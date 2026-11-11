import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { Wishlist } from '../../domain/wishlist.model';

export type GetWishlistsByIdsInput = {
  currentUser: ICurrentUser;
  wishlistIds: WishlistId[];
};

@Injectable()
export class GetWishlistsByIdsUseCase {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(input: GetWishlistsByIdsInput): Promise<Wishlist[]> {
    if (input.currentUser.isAdmin) {
      return this.wishlistRepository.findByIds(input.wishlistIds);
    }

    const wishlistIds = (
      await Promise.all(
        input.wishlistIds.map(wishlistId =>
          this.wishlistRepository.hasAccess({
            wishlistId,
            userId: input.currentUser.id,
          }),
        ),
      )
    )
      .filter(Boolean)
      .map((hasAccess, index) => (hasAccess ? input.wishlistIds[index] : undefined))
      .filter((wishlistId): wishlistId is WishlistId => wishlistId !== undefined);

    return this.wishlistRepository.findByIds(wishlistIds);
  }
}
