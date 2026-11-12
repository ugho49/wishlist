import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { BucketService } from '../../../core/bucket/bucket.service';

export type RemoveWishlistLogoInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
};

@Injectable()
export class RemoveWishlistLogoUseCase {
  private readonly logger = getLogger(RemoveWishlistLogoUseCase.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: RemoveWishlistLogoInput): Promise<void> {
    this.logger.info('Remove wishlist logo request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist');
    }

    const destination = this.bucketService.getLogoDestination(command.wishlistId);
    this.logger.info('Removing logo from bucket...', { wishlistId: command.wishlistId, destination });
    await this.bucketService.removeIfExist({ destination });

    const updatedWishlist = wishlist.updateLogoUrl(undefined);

    this.logger.info('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['logoUrl'] });
    await this.wishlistRepository.save(updatedWishlist);
  }
}
