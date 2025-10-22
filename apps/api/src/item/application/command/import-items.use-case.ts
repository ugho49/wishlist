import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { WishlistItemRepository } from '@wishlist/api/item'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { ImportItemsCommand, ImportItemsResult } from '../../domain'
import { itemMapper } from '../../infrastructure'

@CommandHandler(ImportItemsCommand)
export class ImportItemsUseCase implements IInferredCommandHandler<ImportItemsCommand> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.WISHLIST_ITEM)
    private readonly itemRepository: WishlistItemRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: ImportItemsCommand): Promise<ImportItemsResult> {
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: wishlist.id,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot import items to this wishlist')
    }

    const items = await this.itemRepository.findByIds(command.sourceItemIds)

    const itemsToImport = items.map(item => item.exportTo({ id: this.itemRepository.newId(), wishlistId: wishlist.id }))

    await this.transactionManager.runInTransaction(async tx => {
      for (const item of itemsToImport) {
        await this.itemRepository.save(item, tx)
      }
    })

    return itemsToImport.map(item => itemMapper.toDto({ item, displayUserAndSuggested: false }))
  }
}
