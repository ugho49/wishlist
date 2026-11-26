import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { NotFoundException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { WishlistItem } from '../../domain/wishlist-item.model';
import { SetItemsPurchasedUseCase } from './set-items-purchased.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('SetItemsPurchasedUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: SetItemsPurchasedUseCase;
  let taker: User;
  let otherTaker: User;
  let book: WishlistItem;
  let scarf: WishlistItem;

  beforeEach(() => {
    mock.clearAllMocks();

    taker = new UserBuilder().withEmail('taker@test.fr').build();
    otherTaker = new UserBuilder().withEmail('other-taker@test.fr').build();
    book = new WishlistItemBuilder().withName('Un livre').takenBy(taker).build();
    scarf = new WishlistItemBuilder().withName('Une écharpe').takenBy(taker).build();

    itemRepository.findByIds.mockResolvedValue([book, scarf]);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new SetItemsPurchasedUseCase(itemRepository, transactionManager);
  });

  describe('when an item cannot be marked by the user', () => {
    it('should reject when one of the items does not exist', async () => {
      itemRepository.findByIds.mockResolvedValueOnce([book]);

      await expect(
        useCase.execute({ currentUser: toCurrentUser(taker), itemIds: [book.id, scarf.id], purchased: true }),
      ).rejects.toThrow(NotFoundException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
      expect(itemRepository.save).not.toHaveBeenCalled();
    });

    it('should reject when the user did not reserve one of the items', async () => {
      const notReserved = new WishlistItemBuilder().takenBy(otherTaker).build();
      itemRepository.findByIds.mockResolvedValueOnce([book, notReserved]);

      await expect(
        useCase.execute({ currentUser: toCurrentUser(taker), itemIds: [book.id, notReserved.id], purchased: true }),
      ).rejects.toThrow(NotFoundException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
      expect(itemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when the user reserved every item', () => {
    it('should mark all the items as purchased in one transaction', async () => {
      const result = await useCase.execute({
        currentUser: toCurrentUser(taker),
        itemIds: [book.id, scarf.id],
        purchased: true,
      });

      expect(result.items.map(item => item.itemId)).toEqual([book.id, scarf.id]);
      expect(result.items.every(item => item.purchasedAt instanceof Date)).toBe(true);
      expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
      expect(itemRepository.save).toHaveBeenCalledTimes(2);
      const savedBook = itemRepository.save.mock.calls[0]?.[0];
      expect(savedBook?.purchasedAtBy(taker.id)).toBeInstanceOf(Date);
    });

    it('should unmark the purchased items', async () => {
      const purchasedBook = new WishlistItemBuilder().takenBy(taker, { purchasedAt: new Date() }).build();
      itemRepository.findByIds.mockResolvedValueOnce([purchasedBook]);

      const result = await useCase.execute({
        currentUser: toCurrentUser(taker),
        itemIds: [purchasedBook.id],
        purchased: false,
      });

      expect(result.items).toEqual([{ itemId: purchasedBook.id, purchasedAt: undefined }]);
      expect(itemRepository.save).toHaveBeenCalledTimes(1);
      expect(itemRepository.save.mock.calls[0]?.[0].purchasedAtBy(taker.id)).toBeUndefined();
    });

    it('should keep the first purchase date and save nothing when the items are already purchased', async () => {
      const firstPurchase = new Date('2026-11-20T10:00:00.000Z');
      const purchasedBook = new WishlistItemBuilder().takenBy(taker, { purchasedAt: firstPurchase }).build();
      itemRepository.findByIds.mockResolvedValueOnce([purchasedBook]);

      const result = await useCase.execute({
        currentUser: toCurrentUser(taker),
        itemIds: [purchasedBook.id],
        purchased: true,
      });

      expect(result.items).toEqual([{ itemId: purchasedBook.id, purchasedAt: firstPurchase }]);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
      expect(itemRepository.save).not.toHaveBeenCalled();
    });

    it('should only save the items whose purchase changes', async () => {
      const purchasedBook = new WishlistItemBuilder().takenBy(taker, { purchasedAt: new Date() }).build();
      itemRepository.findByIds.mockResolvedValueOnce([purchasedBook, scarf]);

      await useCase.execute({
        currentUser: toCurrentUser(taker),
        itemIds: [purchasedBook.id, scarf.id],
        purchased: true,
      });

      expect(itemRepository.save).toHaveBeenCalledTimes(1);
      expect(itemRepository.save.mock.calls[0]?.[0].id).toBe(scarf.id);
    });

    it('should load each item once when an id is repeated', async () => {
      itemRepository.findByIds.mockResolvedValueOnce([book]);

      const result = await useCase.execute({
        currentUser: toCurrentUser(taker),
        itemIds: [book.id, book.id],
        purchased: true,
      });

      expect(itemRepository.findByIds).toHaveBeenCalledWith([book.id]);
      expect(result.items).toHaveLength(1);
    });

    it('should leave the purchase of the other takers untouched on a group gift', async () => {
      const otherPurchase = new Date('2026-11-20T10:00:00.000Z');
      const groupGift = new WishlistItemBuilder()
        .takenBy(taker)
        .takenBy(otherTaker, { purchasedAt: otherPurchase })
        .build();
      itemRepository.findByIds.mockResolvedValueOnce([groupGift]);

      await useCase.execute({ currentUser: toCurrentUser(taker), itemIds: [groupGift.id], purchased: true });

      const saved = itemRepository.save.mock.calls[0]?.[0];
      expect(saved?.purchasedAtBy(taker.id)).toBeInstanceOf(Date);
      expect(saved?.purchasedAtBy(otherTaker.id)).toBe(otherPurchase);
    });
  });
});
