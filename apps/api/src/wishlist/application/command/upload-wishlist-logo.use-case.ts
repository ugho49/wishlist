import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { BucketService } from '../../../core/bucket/bucket.service';

export type UploadWishlistLogoInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
  file: File;
};

export type UploadWishlistLogoResult = {
  logoUrl: string;
};

@Injectable()
export class UploadWishlistLogoUseCase {
  private readonly logger = getLogger(UploadWishlistLogoUseCase.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UploadWishlistLogoInput): Promise<UploadWishlistLogoResult> {
    this.logger.info('Upload wishlist logo request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist');
    }

    const destination = this.bucketService.getLogoDestination(command.wishlistId);

    try {
      this.logger.info('Removing existing logo from bucket...', { wishlistId: command.wishlistId, destination });
      await this.bucketService.removeIfExist({ destination });
    } catch (e) {
      this.logger.error('Fail to delete existing logo for wishlist', { wishlistId: wishlist.id, error: e });
    }

    this.logger.info('Uploading new logo to bucket...', { wishlistId: command.wishlistId, destination });
    const newLogoUrl = await this.bucketService.uploadFile({
      destination,
      file: command.file,
    });

    const updatedWishlist = wishlist.updateLogoUrl(newLogoUrl);

    this.logger.info('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['logoUrl'] });
    await this.wishlistRepository.save(updatedWishlist);

    return { logoUrl: newLogoUrl };
  }
}
