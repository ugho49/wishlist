import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { type ICurrentUser, type WishlistId } from '@wishlist/common';

import { BucketService } from '../../../core/bucket/bucket.service';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type DeleteWishlistInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
};

@Injectable()
export class DeleteWishlistUseCase {
  private readonly logger = new Logger(DeleteWishlistUseCase.name);

  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: DeleteWishlistInput): Promise<void> {
    this.logger.log('Delete wishlist request received', { command });
    const { currentUser, wishlistId } = command;

    // 1. Find wishlist and check permissions
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId);

    const userCanDeleteList = wishlist.isOwnerOrCoOwner(currentUser.id) || currentUser.isAdmin;

    if (!userCanDeleteList) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can delete it');
    }

    // 2. Delete wishlist
    this.logger.log('Deleting wishlist...', { wishlistId });
    await this.wishlistRepository.delete(wishlistId);

    // 3. Clean up logo from bucket if exists
    const logoDest = this.bucketService.getLogoDestination(wishlistId);
    this.logger.log('Removing logo from bucket...', { wishlistId, logoDest });
    await this.bucketService.removeIfExist({ destination: logoDest });
  }
}
