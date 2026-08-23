import type { ItemId } from '@wishlist/common';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { CreateItemUseCase } from './create-item.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateItemUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const itemRepository = createMock<WishlistItemRepository>();

  let useCase: CreateItemUseCase;
  let owner: User;
  let wishlist: Wishlist;
  let itemId: ItemId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).build();
    itemId = uuid() as ItemId;

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    wishlistRepository.hasAccess.mockResolvedValue(true);
    itemRepository.newId.mockReturnValue(itemId);
    itemRepository.save.mockResolvedValue(undefined);

    useCase = new CreateItemUseCase(wishlistRepository, itemRepository);
  });

  it('should reject when the user has no access to the wishlist', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        newItem: { name: 'Un livre' },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(itemRepository.save).not.toHaveBeenCalled();
  });

  it('should create a non-suggested item when the owner adds it', async () => {
    const item = await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
      newItem: { name: 'Un livre', description: 'SF', score: 5 },
    });

    expect(item.id).toBe(itemId);
    expect(item.wishlistId).toBe(wishlist.id);
    expect(item.name).toBe('Un livre');
    expect(item.description).toBe('SF');
    expect(item.score).toBe(5);
    expect(item.isSuggested).toBe(false);
    expect(itemRepository.save).toHaveBeenCalledWith(item);
  });

  it('should create a suggested item when a participant adds it', async () => {
    const participant = new UserBuilder().withEmail('participant@test.fr').build();

    const item = await useCase.execute({
      currentUser: toCurrentUser(participant),
      wishlistId: wishlist.id,
      newItem: { name: 'Un jeu' },
    });

    expect(item.isSuggested).toBe(true);
    expect(item.name).toBe('Un jeu');
    expect(itemRepository.save).toHaveBeenCalledWith(item);
  });

  it('should create a non-suggested item when a co-owner adds it', async () => {
    const coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    wishlistRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).build(),
    );

    const item = await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
      newItem: { name: 'Un vinyle' },
    });

    expect(item.isSuggested).toBe(false);
    expect(itemRepository.save).toHaveBeenCalledWith(item);
  });
});
