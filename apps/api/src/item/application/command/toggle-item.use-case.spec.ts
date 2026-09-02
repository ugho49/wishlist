import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { WishlistItem } from '../../domain/wishlist-item.model';
import { ToggleItemUseCase } from './toggle-item.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('ToggleItemUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const wishlistRepository = createMock<WishlistRepository>();
  const userRepository = createMock<UserRepository>();

  let useCase: ToggleItemUseCase;
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
    userRepository.findByIdOrFail.mockResolvedValue(participant);

    useCase = new ToggleItemUseCase(itemRepository, wishlistRepository, userRepository);
  });

  it('should reject when the user has no access to the wishlist', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);

    await expect(useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(itemRepository.save).not.toHaveBeenCalled();
    expect(wishlistRepository.findByIdOrFail).not.toHaveBeenCalled();
  });

  describe('when the current user is a participant', () => {
    it('should check an item that is not yet taken by them', async () => {
      const result = await useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id });

      expect(result.takers).toHaveLength(1);
      expect(result.takers[0]?.userId).toBe(participant.id);
      expect(itemRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should uncheck an item already taken by them', async () => {
      itemRepository.findByIdOrFail.mockResolvedValueOnce(
        new WishlistItemBuilder().withWishlistId(wishlist.id).takenBy(participant).build(),
      );

      const result = await useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id });

      expect(result.takers).toEqual([]);
      expect(itemRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    });

    it('should join an item already taken by someone else', async () => {
      const otherTaker = new UserBuilder().withEmail('other@test.fr').build();
      itemRepository.findByIdOrFail.mockResolvedValueOnce(
        new WishlistItemBuilder().withWishlistId(wishlist.id).takenBy(otherTaker).build(),
      );

      const result = await useCase.execute({ currentUser: toCurrentUser(participant), itemId: item.id });

      expect(result.takers.map(taker => taker.userId).toSorted()).toEqual([otherTaker.id, participant.id].toSorted());
      expect(itemRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the current user is the owner and hideItems is enabled', () => {
    it('should reject checking their own items', async () => {
      await expect(useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(itemRepository.save).not.toHaveBeenCalled();
    });

    it('should reject unchecking their own items', async () => {
      itemRepository.findByIdOrFail.mockResolvedValueOnce(
        new WishlistItemBuilder().withWishlistId(wishlist.id).takenBy(owner).build(),
      );

      await expect(useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(itemRepository.save).not.toHaveBeenCalled();
    });

    it('should hide suggested items when checking', async () => {
      itemRepository.findByIdOrFail.mockResolvedValueOnce(
        new WishlistItemBuilder().withWishlistId(wishlist.id).asSuggested().build(),
      );

      await expect(useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id })).rejects.toThrow(
        NotFoundException,
      );
      expect(itemRepository.save).not.toHaveBeenCalled();
    });

    it('should hide suggested items when unchecking', async () => {
      itemRepository.findByIdOrFail.mockResolvedValueOnce(
        new WishlistItemBuilder().withWishlistId(wishlist.id).asSuggested().takenBy(owner).build(),
      );

      await expect(useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id })).rejects.toThrow(
        NotFoundException,
      );
      expect(itemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when the current user is the owner and hideItems is disabled', () => {
    it('should allow checking their own items', async () => {
      const publicWishlist = new WishlistBuilder().withOwner(owner).withHideItems(false).build();
      wishlistRepository.findByIdOrFail.mockResolvedValueOnce(publicWishlist);
      userRepository.findByIdOrFail.mockResolvedValueOnce(owner);

      const result = await useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id });

      expect(result.takers).toHaveLength(1);
      expect(result.takers[0]?.userId).toBe(owner.id);
      expect(itemRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
