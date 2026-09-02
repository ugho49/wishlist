import type { WishlistId } from '@wishlist/common';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { GetItemsByWishlistsUseCase } from './get-items-by-wishlists.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetItemsByWishlistsUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();

  let useCase: GetItemsByWishlistsUseCase;
  let user: User;
  let firstWishlistId: WishlistId;
  let secondWishlistId: WishlistId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    firstWishlistId = uuid() as WishlistId;
    secondWishlistId = uuid() as WishlistId;
    itemRepository.findByWishlistIds.mockResolvedValue([]);

    useCase = new GetItemsByWishlistsUseCase(itemRepository);
  });

  it('should group items by wishlist id', async () => {
    const firstItem = new WishlistItemBuilder().withWishlistId(firstWishlistId).withName('Livre').build();
    const secondItem = new WishlistItemBuilder().withWishlistId(firstWishlistId).withName('Jeu').build();
    const thirdItem = new WishlistItemBuilder().withWishlistId(secondWishlistId).withName('Mug').build();
    itemRepository.findByWishlistIds.mockResolvedValueOnce([firstItem, secondItem, thirdItem]);

    const { mappedItems } = await useCase.execute({
      currentUser: toCurrentUser(user),
      wishlistIds: [firstWishlistId, secondWishlistId],
    });

    expect(itemRepository.findByWishlistIds).toHaveBeenCalledWith([firstWishlistId, secondWishlistId]);
    expect(mappedItems.get(firstWishlistId)).toEqual([firstItem, secondItem]);
    expect(mappedItems.get(secondWishlistId)).toEqual([thirdItem]);
  });

  it('should return an empty list for wishlists that have no items', async () => {
    const item = new WishlistItemBuilder().withWishlistId(firstWishlistId).build();
    itemRepository.findByWishlistIds.mockResolvedValueOnce([item]);

    const { mappedItems } = await useCase.execute({
      currentUser: toCurrentUser(user),
      wishlistIds: [firstWishlistId, secondWishlistId],
    });

    expect(mappedItems.get(firstWishlistId)).toEqual([item]);
    expect(mappedItems.get(secondWishlistId)).toEqual([]);
  });

  it('should ignore items that do not belong to the requested wishlists', async () => {
    const requestedItem = new WishlistItemBuilder().withWishlistId(firstWishlistId).build();
    const orphanItem = new WishlistItemBuilder().withWishlistId(uuid() as WishlistId).build();
    itemRepository.findByWishlistIds.mockResolvedValueOnce([requestedItem, orphanItem]);

    const { mappedItems } = await useCase.execute({
      currentUser: toCurrentUser(user),
      wishlistIds: [firstWishlistId],
    });

    expect(mappedItems.size).toBe(1);
    expect(mappedItems.get(firstWishlistId)).toEqual([requestedItem]);
  });
});
