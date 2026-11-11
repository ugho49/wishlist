import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

export type RemoveCoOwnerInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
};

@Injectable()
export class RemoveCoOwnerUseCase {
  private readonly logger = getLogger(RemoveCoOwnerUseCase.name);

  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(command: RemoveCoOwnerInput): Promise<void> {
    this.logger.info('Remove co-owner request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);

    // Only the owner can remove the co-owner
    if (!wishlist.isOwner(command.currentUser.id)) {
      throw new UnauthorizedException('Only the owner can remove the co-owner');
    }

    const updatedWishlist = wishlist.removeCoOwner();

    this.logger.info('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['coOwner'] });
    await this.wishlistRepository.save(updatedWishlist);
  }
}
