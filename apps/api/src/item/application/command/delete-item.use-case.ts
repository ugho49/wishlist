import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, ItemId } from '@wishlist/common'

import { WishlistItemRepository } from '../../domain'

export type DeleteItemInput = {
  currentUser: ICurrentUser
  itemId: ItemId
}

@Injectable()
export class DeleteItemUseCase {
  private readonly logger = new Logger(DeleteItemUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(command: DeleteItemInput): Promise<void> {
    this.logger.log('Delete item request received', { command })
    const item = await this.itemRepository.findByIdOrFail(command.itemId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: item.wishlistId,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot delete this item, you are not the owner of the list or a participant')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(item.wishlistId)
    const isOwnerOrCoOwnerOfList = wishlist.isOwnerOrCoOwner(command.currentUser.id)

    if (item.isSuggested && isOwnerOrCoOwnerOfList && wishlist.hideItems) {
      throw new UnauthorizedException('You cannot delete this item')
    }

    if (item.isSuggested && item.isTakenBySomeone() && !item.isTakenBy(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot delete this item, is already taken')
    }

    if (!item.isSuggested && !isOwnerOrCoOwnerOfList) {
      throw new UnauthorizedException('You cannot delete this item, only the creator of the list can')
    }

    if (!item.isSuggested && item.isTakenBySomeone()) {
      const updatedItem = item.convertToSuggested()
      await this.itemRepository.save(updatedItem)
      return
    }

    this.logger.log('Deleting item...', { itemId: item.id })
    await this.itemRepository.delete(item.id)
  }
}
