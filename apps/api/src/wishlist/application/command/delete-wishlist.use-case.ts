import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { BucketService } from '../../../core/bucket/bucket.service';

export type DeleteWishlistInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
};

@Injectable()
export class DeleteWishlistUseCase {
  private readonly logger = getLogger(DeleteWishlistUseCase.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: DeleteWishlistInput): Promise<void> {
    this.logger.info('Delete wishlist request received', { command });
    const { currentUser, wishlistId } = command;

    // 1. Find wishlist and check permissions
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId);

    const userCanDeleteList = wishlist.isOwnerOrCoOwner(currentUser.id) || currentUser.isAdmin;

    if (!userCanDeleteList) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can delete it');
    }

    // 2. Delete wishlist
    this.logger.info('Deleting wishlist...', { wishlistId });
    await this.wishlistRepository.delete(wishlistId);

    // 3. Clean up logo from bucket if exists
    const logoDest = this.bucketService.getLogoDestination(wishlistId);
    this.logger.info('Removing logo from bucket...', { wishlistId, logoDest });
    await this.bucketService.removeIfExist({ destination: logoDest });
  }
}
