import type { ICurrentUser, WishlistId } from '@wishlist/common';
import type { WishlistItemRepository } from '../../../item/domain/wishlist-item.repository';
import type { User, UserGiftProfile } from '../../../user/domain/model/user.model';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Inject, Injectable } from '@nestjs/common';

import { WishlistItem } from '../../../item/domain/wishlist-item.model';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetWishlistOwnerGiftProfileInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
};

@Injectable()
export class GetWishlistOwnerGiftProfileUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
  ) {}

  async execute(input: GetWishlistOwnerGiftProfileInput): Promise<UserGiftProfile | undefined> {
    const wishlist = await this.wishlistRepository.findByIdOrFail(input.wishlistId);
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: wishlist.id,
      userId: input.currentUser.id,
    });
    if (!hasAccess) return undefined;

    const canViewPreferences = WishlistItem.canDisplaySensitiveInformations({
      wishlist: {
        hideItems: wishlist.hideItems,
        isOwner: wishlist.isOwner(input.currentUser.id),
        isCoOwner: wishlist.isCoOwner(input.currentUser.id),
      },
    });
    if (!canViewPreferences) return undefined;

    const owner = await this.userRepository.findByIdOrFail(wishlist.ownerId);
    const hasReserved = await this.itemRepository.hasReservedOnWishlist({
      userId: input.currentUser.id,
      wishlistId: wishlist.id,
    });

    return toVisibleGiftProfile(owner, hasReserved);
  }
}

export function toVisibleGiftProfile(owner: User, includeAddress: boolean): UserGiftProfile {
  const profile = owner.getGiftProfile();
  if (includeAddress) return profile;
  return {
    clothingSize: profile.clothingSize,
    shoeSize: profile.shoeSize,
    notes: profile.notes,
  };
}
