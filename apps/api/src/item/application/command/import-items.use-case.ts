import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { type ICurrentUser, type ItemId, type WishlistId } from '@wishlist/common';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import { WishlistItem } from '../../domain/wishlist-item.model';

export type ImportItemsInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
  sourceItemIds: ItemId[];
};

@Injectable()
export class ImportItemsUseCase {
  private readonly logger = new Logger(ImportItemsUseCase.name);

  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.WISHLIST_ITEM)
    private readonly itemRepository: WishlistItemRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: ImportItemsInput): Promise<WishlistItem[]> {
    this.logger.log('Import items request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: wishlist.id,
      userId: command.currentUser.id,
    });

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot import items to this wishlist');
    }

    const sourceItems = await this.itemRepository.findByIds(command.sourceItemIds);
    const sourceWishlistIds = [...new Set(sourceItems.map(item => item.wishlistId))];
    const sourceWishlists = await this.wishlistRepository.findByIds(sourceWishlistIds);

    // Verify that all source items belong to the current user
    for (const sourceWishlist of sourceWishlists) {
      if (!sourceWishlist.isOwner(command.currentUser.id)) {
        throw new UnauthorizedException('You cannot import items from another user wishlist');
      }
    }

    const itemsToImport = sourceItems.map(item =>
      item.exportTo({ id: this.itemRepository.newId(), wishlistId: wishlist.id }),
    );

    this.logger.log('Creating items to import...', {
      wishlistId: wishlist.id,
      itemsToImport: itemsToImport.map(item => item.id),
    });

    await this.transactionManager.runInTransaction(async tx => {
      for (const item of itemsToImport) {
        await this.itemRepository.save(item, tx);
      }
    });

    return itemsToImport;
  }
}
