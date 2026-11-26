import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { type ICurrentUser, type ItemId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';

export type SetItemsPurchasedInput = {
  currentUser: ICurrentUser;
  itemIds: ItemId[];
  purchased: boolean;
};

export type ItemPurchaseState = {
  itemId: ItemId;
  purchasedAt?: Date;
};

export type SetItemsPurchasedOutput = {
  items: ItemPurchaseState[];
};

@Injectable()
export class SetItemsPurchasedUseCase {
  private readonly logger = getLogger(SetItemsPurchasedUseCase.name);

  constructor(
    private readonly itemRepository: WishlistItemRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: SetItemsPurchasedInput): Promise<SetItemsPurchasedOutput> {
    const userId = input.currentUser.id;
    const itemIds = [...new Set(input.itemIds)];
    this.logger.info('Set items purchased request received', { userId, itemIds, purchased: input.purchased });

    const items = await this.itemRepository.findByIds(itemIds);
    const reservedItems = items.filter(item => item.isTakenBy(userId));

    // All or nothing: an unknown gift, or one the user did not reserve, stays hidden behind a 404.
    if (reservedItems.length !== itemIds.length) {
      throw new NotFoundException('Item not found');
    }

    const updatedItems = reservedItems.map(item =>
      input.purchased ? item.markAsPurchasedBy(userId) : item.unmarkAsPurchasedBy(userId),
    );
    const changedItems = updatedItems.filter((item, index) => item !== reservedItems[index]);

    if (changedItems.length > 0) {
      await this.transactionManager.runInTransaction(async tx => {
        for (const item of changedItems) {
          await this.itemRepository.save(item, tx);
        }
      });
    }

    return {
      items: updatedItems.map(item => ({ itemId: item.id, purchasedAt: item.purchasedAtBy(userId) })),
    };
  }
}
