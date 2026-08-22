import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type ICurrentUser, type WishlistId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { Wishlist } from '../../domain/wishlist.model';

export type GetWishlistsByIdsInput = {
  currentUser: ICurrentUser;
  wishlistIds: WishlistId[];
};

@Injectable()
export class GetWishlistsByIdsUseCase {
  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(input: GetWishlistsByIdsInput): Promise<Wishlist[]> {
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
