import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { WISHLIST_ITEM_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { DeleteItemCommand, DeleteItemResult, WishlistItemRepository } from '../../domain'

@CommandHandler(DeleteItemCommand)
export class DeleteItemUseCase implements IInferredCommandHandler<DeleteItemCommand> {
  constructor(
    @Inject(WISHLIST_ITEM_REPOSITORY) private readonly itemRepository: WishlistItemRepository,
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(command: DeleteItemCommand): Promise<DeleteItemResult> {
    const item = await this.itemRepository.findByIdOrFail(command.itemId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: item.wishlistId,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot delete this item, you are not the owner of the list or a participant')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(item.wishlistId)
    const isOwnerOfList = wishlist.isOwner(command.currentUser.id)

    if (item.isSuggested && isOwnerOfList) {
      throw new UnauthorizedException('You cannot delete this item')
    }

    if (item.isSuggested && item.isTakenBySomeone() && !item.isTakenBy(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot delete this item, is already taken')
    }

    if (!item.isSuggested && !isOwnerOfList) {
      throw new UnauthorizedException('You cannot delete this item, only the creator of the list can')
    }

    if (!item.isSuggested && item.isTakenBySomeone()) {
      const updatedItem = item.convertToSuggested()
      await this.itemRepository.save(updatedItem)
      return
    }

    await this.itemRepository.delete(item.id)
  }
}
