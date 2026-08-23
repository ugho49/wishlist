import type { ItemId } from '@wishlist/common';
import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { WishlistItem } from '../../domain/wishlist-item.model';
import { ImportItemsUseCase } from './import-items.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('ImportItemsUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const itemRepository = createMock<WishlistItemRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: ImportItemsUseCase;
  let owner: User;
  let stranger: User;
  let targetWishlist: Wishlist;
  let sourceWishlist: Wishlist;
  let sourceItem: WishlistItem;
  let importedItemId: ItemId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    targetWishlist = new WishlistBuilder().withOwner(owner).build();
    sourceWishlist = new WishlistBuilder().withOwner(owner).withTitle('Ancienne liste').build();
    sourceItem = new WishlistItemBuilder().withWishlistId(sourceWishlist.id).withName('Un livre').build();
    importedItemId = uuid() as ItemId;

    wishlistRepository.findByIdOrFail.mockResolvedValue(targetWishlist);
    wishlistRepository.hasAccess.mockResolvedValue(true);
    wishlistRepository.findByIds.mockResolvedValue([sourceWishlist]);
    itemRepository.findByIds.mockResolvedValue([sourceItem]);
    itemRepository.newId.mockReturnValue(importedItemId);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new ImportItemsUseCase(wishlistRepository, itemRepository, transactionManager);
  });

  it('should reject when the user has no access to the target wishlist', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: targetWishlist.id,
        sourceItemIds: [sourceItem.id],
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(itemRepository.findByIds).not.toHaveBeenCalled();
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
  });

  it('should reject when a source wishlist is not owned by the current user', async () => {
    wishlistRepository.findByIds.mockResolvedValueOnce([
      new WishlistBuilder().withOwner(stranger).withTitle('Liste d un autre').build(),
    ]);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: targetWishlist.id,
        sourceItemIds: [sourceItem.id],
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(itemRepository.save).not.toHaveBeenCalled();
  });

  it('should import items owned by the current user into the target wishlist', async () => {
    const importedItems = await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: targetWishlist.id,
      sourceItemIds: [sourceItem.id],
    });

    expect(importedItems).toHaveLength(1);
    expect(importedItems[0]?.id).toBe(importedItemId);
    expect(importedItems[0]?.wishlistId).toBe(targetWishlist.id);
    expect(importedItems[0]?.name).toBe('Un livre');
    expect(importedItems[0]?.importSourceId).toBe(sourceItem.id);
    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    expect(itemRepository.save).toHaveBeenCalledTimes(1);
    expect(itemRepository.save).toHaveBeenCalledWith(importedItems[0], undefined);
  });
});
