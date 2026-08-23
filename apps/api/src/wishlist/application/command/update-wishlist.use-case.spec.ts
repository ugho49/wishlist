import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { UpdateWishlistUseCase } from './update-wishlist.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateWishlistUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: UpdateWishlistUseCase;
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

    useCase = new UpdateWishlistUseCase(wishlistRepository);
  });

  it('should reject when the current user is neither owner nor co-owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        wishlistId: wishlist.id,
        updateWishlist: { title: 'Nouveau titre' },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should update the wishlist when the owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
      updateWishlist: { title: 'Nouveau titre', description: 'Une description' },
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.title).toBe('Nouveau titre');
    expect(savedWishlist?.description).toBe('Une description');
  });

  it('should update the wishlist when the co-owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
      updateWishlist: { title: 'Titre co-owner' },
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.title).toBe('Titre co-owner');
  });
});
