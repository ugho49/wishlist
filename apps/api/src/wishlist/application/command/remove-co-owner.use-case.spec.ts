import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { RemoveCoOwnerUseCase } from './remove-co-owner.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RemoveCoOwnerUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: RemoveCoOwnerUseCase;
  let owner: User;
  let coOwner: User;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).build();

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);

    useCase = new RemoveCoOwnerUseCase(wishlistRepository);
  });

  it('should reject when the current user is not the owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(coOwner),
        wishlistId: wishlist.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should remove the co-owner and persist the wishlist', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.coOwnerId).toBeUndefined();
  });
});
