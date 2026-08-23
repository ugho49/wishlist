import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { GetWishlistsByIdsUseCase } from './get-wishlists-by-ids.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetWishlistsByIdsUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: GetWishlistsByIdsUseCase;
  let user: User;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(user).build();
    wishlistRepository.hasAccess.mockResolvedValue(true);
    wishlistRepository.findByIds.mockResolvedValue([wishlist]);

    useCase = new GetWishlistsByIdsUseCase(wishlistRepository);
  });

  it('should return wishlists the current user can access', async () => {
    const wishlistIds = [wishlist.id];

    const result = await useCase.execute({ currentUser: toCurrentUser(user), wishlistIds });

    expect(wishlistRepository.hasAccess).toHaveBeenCalledWith({ wishlistId: wishlist.id, userId: user.id });
    expect(wishlistRepository.findByIds).toHaveBeenCalledWith(wishlistIds);
    expect(result).toEqual([wishlist]);
  });

  it('should not load wishlists the current user cannot access', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);
    wishlistRepository.findByIds.mockResolvedValueOnce([]);

    const result = await useCase.execute({
      currentUser: toCurrentUser(user),
      wishlistIds: [wishlist.id],
    });

    expect(wishlistRepository.findByIds).toHaveBeenCalledWith([]);
    expect(result).toEqual([]);
  });
});
