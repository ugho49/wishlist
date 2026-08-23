import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { WishlistItem } from '../../domain/wishlist-item.model';
import { DeleteItemUseCase } from './delete-item.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('DeleteItemUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: DeleteItemUseCase;
  let owner: User;
  let participant: User;
  let wishlist: Wishlist;
  let item: WishlistItem;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).withHideItems(true).build();
    item = new WishlistItemBuilder().withWishlistId(wishlist.id).build();

    itemRepository.findByIdOrFail.mockResolvedValue(item);
    wishlistRepository.hasAccess.mockResolvedValue(true);
    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);

    useCase = new DeleteItemUseCase(itemRepository, wishlistRepository);
  });

  it('should reject when the user has no access to the wishlist', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);

    await expect(useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(itemRepository.delete).not.toHaveBeenCalled();
    expect(itemRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the owner tries to delete a suggested item on a hidden list', async () => {
    itemRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistItemBuilder().withWishlistId(wishlist.id).asSuggested().build(),
    );

    await expect(useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(itemRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when a suggested item is already taken by someone else', async () => {
    itemRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistItemBuilder().withWishlistId(wishlist.id).asSuggested().takenBy(owner).build(),
    );

    await expect(useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(itemRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when a participant tries to delete a non-suggested item', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(itemRepository.delete).not.toHaveBeenCalled();
  });

  it('should convert a taken non-suggested item to suggested instead of deleting it', async () => {
    itemRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistItemBuilder().withWishlistId(wishlist.id).takenBy(participant).build(),
    );

    await useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id });

    expect(itemRepository.delete).not.toHaveBeenCalled();
    expect(itemRepository.save).toHaveBeenCalledTimes(1);
    const savedItem = itemRepository.save.mock.calls[0]?.[0];
    expect(savedItem?.isSuggested).toBe(true);
  });

  it('should delete a non-suggested item that is not taken when the owner requests it', async () => {
    await useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id });

    expect(itemRepository.delete).toHaveBeenCalledWith(item.id);
    expect(itemRepository.save).not.toHaveBeenCalled();
  });

  it('should delete a suggested item taken by the current participant', async () => {
    const suggestedItem = new WishlistItemBuilder()
      .withWishlistId(wishlist.id)
      .asSuggested()
      .takenBy(participant)
      .build();
    itemRepository.findByIdOrFail.mockResolvedValueOnce(suggestedItem);

    await useCase.execute({ currentUser: toCurrentUser(participant), itemId: suggestedItem.id });

    expect(itemRepository.delete).toHaveBeenCalledWith(suggestedItem.id);
  });
});
