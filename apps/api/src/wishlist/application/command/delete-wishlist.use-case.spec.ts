import type { BucketService } from '../../../core/bucket/bucket.service';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { DeleteWishlistUseCase } from './delete-wishlist.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('DeleteWishlistUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: DeleteWishlistUseCase;
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

    useCase = new DeleteWishlistUseCase(wishlistRepository, bucketService);
  });

  it('should reject when the current user is not owner, co-owner or admin', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        wishlistId: wishlist.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.delete).not.toHaveBeenCalled();
    expect(bucketService.removeIfExist).not.toHaveBeenCalled();
  });

  it('should delete the wishlist and remove the logo when the owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
    });

    expect(wishlistRepository.delete).toHaveBeenCalledWith(wishlist.id);
    expect(bucketService.getLogoDestination).toHaveBeenCalledWith(wishlist.id);
    expect(bucketService.removeIfExist).toHaveBeenCalledWith({
      destination: `pictures/wishlists/${wishlist.id}/logo`,
    });
  });

  it('should delete the wishlist when the co-owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
    });

    expect(wishlistRepository.delete).toHaveBeenCalledWith(wishlist.id);
    expect(bucketService.removeIfExist).toHaveBeenCalledTimes(1);
  });

  it('should delete the wishlist when an admin requests it', async () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();

    await useCase.execute({
      currentUser: toCurrentUser(admin),
      wishlistId: wishlist.id,
    });

    expect(wishlistRepository.delete).toHaveBeenCalledWith(wishlist.id);
    expect(bucketService.removeIfExist).toHaveBeenCalledTimes(1);
  });
});
