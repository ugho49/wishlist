import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { GetWishlistsByUserUseCase } from './get-wishlists-by-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetWishlistsByUserUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: GetWishlistsByUserUseCase;
  let user: User;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(user).build();
    wishlistRepository.findByUserPaginated.mockResolvedValue({ wishlists: [wishlist], totalCount: 1 });

    useCase = new GetWishlistsByUserUseCase(wishlistRepository);
  });

  it('should return paginated wishlists for the user', async () => {
    const result = await useCase.execute({ userId: user.id, pageNumber: 2, pageSize: 10 });

    expect(result).toEqual({ wishlists: [wishlist], totalCount: 1 });
    expect(wishlistRepository.findByUserPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 10 },
    });
  });
});
