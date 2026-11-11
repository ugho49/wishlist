import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

export type UpdateWishlistInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
  updateWishlist: {
    title: string;
    description?: string;
  };
};

@Injectable()
export class UpdateWishlistUseCase {
  private readonly logger = getLogger(UpdateWishlistUseCase.name);

  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(command: UpdateWishlistInput): Promise<void> {
    this.logger.info('Update wishlist request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist');
    }

    const updatedWishlist = wishlist.update({
      title: command.updateWishlist.title,
      description: command.updateWishlist.description,
    });

    this.logger.info('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['title', 'description'] });
    await this.wishlistRepository.save(updatedWishlist);
  }
}
