import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';
import { TidyURL } from 'tidy-url';

import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import { WishlistItem } from '../../domain/wishlist-item.model';

export type CreateItemInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
  newItem: {
    name: string;
    description?: string;
    score?: number;
    url?: string;
    pictureUrl?: string;
  };
};

@Injectable()
export class CreateItemUseCase {
  private readonly logger = getLogger(CreateItemUseCase.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly itemRepository: WishlistItemRepository,
  ) {}

  async execute(command: CreateItemInput): Promise<WishlistItem> {
    this.logger.info('Create item request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: wishlist.id,
      userId: command.currentUser.id,
    });

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot add items to this wishlist');
    }

    const isSuggested = !wishlist.isOwnerOrCoOwner(command.currentUser.id);
    const url = command.newItem.url ? TidyURL.clean(command.newItem.url).url : undefined;

    const item = WishlistItem.create({
      id: this.itemRepository.newId(),
      wishlistId: wishlist.id,
      name: command.newItem.name,
      description: command.newItem.description,
      score: command.newItem.score,
      url,
      imageUrl: command.newItem.pictureUrl,
      isSuggested,
    });

    this.logger.info('Saving item...', { item });
    await this.itemRepository.save(item);

    return item;
  }
}
