import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { WishlistItem } from '../../domain/wishlist-item.model';
import { GetImportableItemsUseCase } from './get-importable-items.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetImportableItemsUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: GetImportableItemsUseCase;
  let owner: User;
  let stranger: User;
  let wishlist: Wishlist;
  let importableItems: WishlistItem[];

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).build();
    importableItems = [new WishlistItemBuilder().withName('Un livre').build()];

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    itemRepository.findImportableItems.mockResolvedValue(importableItems);

    useCase = new GetImportableItemsUseCase(itemRepository, wishlistRepository);
  });

  it('should reject when the user is not the owner of the wishlist', async () => {
    await expect(
      useCase.execute({
        userId: stranger.id,
        wishlistId: wishlist.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(itemRepository.findImportableItems).not.toHaveBeenCalled();
  });

  it('should return importable items when the user owns the wishlist', async () => {
    const result = await useCase.execute({
      userId: owner.id,
      wishlistId: wishlist.id,
    });

    expect(result).toBe(importableItems);
    expect(itemRepository.findImportableItems).toHaveBeenCalledWith({
      userId: owner.id,
      wishlistId: wishlist.id,
    });
  });
});
