import type { ReservedItem, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetMyReservedItemsInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
};

export type GetMyReservedItemsOutput = {
  items: ReservedItem[];
  totalCount: number;
};

@Injectable()
export class GetMyReservedItemsUseCase {
  constructor(@Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository) {}

  async execute(input: GetMyReservedItemsInput): Promise<GetMyReservedItemsOutput> {
    const skip = (input.pageNumber - 1) * input.pageSize;

    return await this.itemRepository.findReservedByUserPaginated({
      userId: input.userId,
      pagination: { take: input.pageSize, skip },
    });
  }
}
