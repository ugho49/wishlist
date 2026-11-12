import type { ReservedItem, ReservedItemPeriod, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';

export type GetMyReservedItemsInput = {
  userId: UserId;
  period: ReservedItemPeriod;
  pageNumber: number;
  pageSize: number;
};

export type GetMyReservedItemsOutput = {
  items: ReservedItem[];
  totalCount: number;
};

@Injectable()
export class GetMyReservedItemsUseCase {
  constructor(private readonly itemRepository: WishlistItemRepository) {}

  async execute(input: GetMyReservedItemsInput): Promise<GetMyReservedItemsOutput> {
    const skip = (input.pageNumber - 1) * input.pageSize;

    return await this.itemRepository.findReservedByUserPaginated({
      userId: input.userId,
      period: input.period,
      pagination: { take: input.pageSize, skip },
    });
  }
}
