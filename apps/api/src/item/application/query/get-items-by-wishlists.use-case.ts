import type { ICurrentUser, WishlistId } from '@wishlist/common';
import type { WishlistItem } from '../../domain/wishlist-item.model';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetItemsByWishlistsInput = {
  currentUser: ICurrentUser;
  wishlistIds: WishlistId[];
};

export type GetItemsByWishlistsOutput = {
  mappedItems: Map<WishlistId, WishlistItem[]>;
};

@Injectable()
export class GetItemsByWishlistsUseCase {
  private readonly logger = new Logger(GetItemsByWishlistsUseCase.name);

  constructor(@Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository) {}

  async execute(input: GetItemsByWishlistsInput): Promise<GetItemsByWishlistsOutput> {
    this.logger.log('Get items by wishlists request received', { input });
    const items = await this.itemRepository.findByWishlistIds(input.wishlistIds);
    const itemsByWishlistId = new Map<WishlistId, WishlistItem[]>();

    for (const wishlistId of input.wishlistIds) {
      itemsByWishlistId.set(wishlistId, []);
    }

    for (const item of items) {
      itemsByWishlistId.get(item.wishlistId)?.push(item);
    }

    return { mappedItems: itemsByWishlistId };
  }
}
