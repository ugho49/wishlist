import type { BucketService } from '../../../core/bucket/bucket.service';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { UploadWishlistLogoUseCase } from './upload-wishlist-logo.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UploadWishlistLogoUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: UploadWishlistLogoUseCase;
  let owner: User;
  let coOwner: User;
  let stranger: User;
  let wishlist: Wishlist;
  let file: Express.Multer.File;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).build();
    file = { originalname: 'logo.png' } as Express.Multer.File;

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    bucketService.getLogoDestination.mockReturnValue(`pictures/wishlists/${wishlist.id}/logo`);
    bucketService.uploadFile.mockResolvedValue('https://cdn.example.com/logo.png');

    useCase = new UploadWishlistLogoUseCase(wishlistRepository, bucketService);
  });

  it('should reject when the current user is neither owner nor co-owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        wishlistId: wishlist.id,
        file,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(bucketService.uploadFile).not.toHaveBeenCalled();
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should replace the logo and persist the new url', async () => {
    const result = await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
      file,
    });

    expect(result.logoUrl).toBe('https://cdn.example.com/logo.png');
    expect(bucketService.removeIfExist).toHaveBeenCalledWith({
      destination: `pictures/wishlists/${wishlist.id}/logo`,
    });
    expect(bucketService.uploadFile).toHaveBeenCalledWith({
      destination: `pictures/wishlists/${wishlist.id}/logo`,
      file,
    });
    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.logoUrl).toBe('https://cdn.example.com/logo.png');
  });

  it('should still upload the new logo when removing the existing one fails', async () => {
    bucketService.removeIfExist.mockRejectedValueOnce(new Error('storage down'));

    const result = await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
      file,
    });

    expect(result.logoUrl).toBe('https://cdn.example.com/logo.png');
    expect(bucketService.uploadFile).toHaveBeenCalledTimes(1);
    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
  });
});
