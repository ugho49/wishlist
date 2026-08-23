import type { BucketService } from '../../../core/bucket/bucket.service';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { RemoveWishlistLogoUseCase } from './remove-wishlist-logo.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RemoveWishlistLogoUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: RemoveWishlistLogoUseCase;
  let owner: User;
  let coOwner: User;
  let stranger: User;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).build();

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    bucketService.getLogoDestination.mockReturnValue(`pictures/wishlists/${wishlist.id}/logo`);

    useCase = new RemoveWishlistLogoUseCase(wishlistRepository, bucketService);
  });

  it('should reject when the current user is neither owner nor co-owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        wishlistId: wishlist.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(bucketService.removeIfExist).not.toHaveBeenCalled();
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should remove the logo from the bucket and persist an empty url', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
    });

    expect(bucketService.removeIfExist).toHaveBeenCalledWith({
      destination: `pictures/wishlists/${wishlist.id}/logo`,
    });
    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.logoUrl).toBeUndefined();
  });

  it('should allow the co-owner to remove the logo', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
    });

    expect(bucketService.removeIfExist).toHaveBeenCalledTimes(1);
    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
  });
});
