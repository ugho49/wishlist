import type { ICurrentUser } from '@wishlist/common';
import type { TakenGiftRecord, TakenItemsScope, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetMyTakenItemsInput = {
  currentUser: ICurrentUser;
  pageNumber: number;
  pageSize: number;
  scope: TakenItemsScope;
};

export type GetMyTakenItemsOutput = {
  items: TakenGiftRecord[];
  totalCount: number;
};

@Injectable()
export class GetMyTakenItemsUseCase {
  constructor(@Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository) {}

  async execute(input: GetMyTakenItemsInput): Promise<GetMyTakenItemsOutput> {
    const skip = (input.pageNumber - 1) * input.pageSize;

    return await this.itemRepository.findTakenByUser({
      userId: input.currentUser.id,
      pagination: { take: input.pageSize, skip },
      scope: input.scope,
    });
  }
}
