import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { Wishlist } from '../../domain/wishlist.model';

export type GetWishlistsByUserInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
};

type GetWishlistsByUserResult = {
  wishlists: Wishlist[];
  totalCount: number;
};

@Injectable()
export class GetWishlistsByUserUseCase {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(input: GetWishlistsByUserInput): Promise<GetWishlistsByUserResult> {
    const pageSize = input.pageSize;
    const skip = (input.pageNumber - 1) * pageSize;

    const { wishlists, totalCount } = await this.wishlistRepository.findByUserPaginated({
      userId: input.userId,
      pagination: { take: pageSize, skip },
    });

    return {
      wishlists,
      totalCount,
    };
  }
}
