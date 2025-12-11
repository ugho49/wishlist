import { Inject, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { TidyURL } from 'tidy-url'

import { UpdateItemCommand, WishlistItemRepository } from '../../domain'

@CommandHandler(UpdateItemCommand)
export class UpdateItemUseCase implements IInferredCommandHandler<UpdateItemCommand> {
  private readonly logger = new Logger(UpdateItemUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(command: UpdateItemCommand) {
    this.logger.log('Update item request received', { command })
    const item = await this.itemRepository.findByIdOrFail(command.itemId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: item.wishlistId,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot update this item, you are not the owner of the list or a participant')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(item.wishlistId)
    const isOwnerOrCoOwnerOfList = wishlist.isOwnerOrCoOwner(command.currentUser.id)

    if (item.isSuggested && isOwnerOrCoOwnerOfList && wishlist.hideItems) {
      throw new NotFoundException('Item not found')
    }

    if (item.isSuggested && item.isTakenBySomeone() && !item.isTakenBy(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot update this item, is already take by someone else')
    }

    if (!item.isSuggested && !isOwnerOrCoOwnerOfList) {
      throw new UnauthorizedException('You cannot update this item, only the creator of the list can')
    }

    const updatedItem = item.update({
      name: command.updateItem.name,
      description: command.updateItem.description,
      url: command.updateItem.url ? TidyURL.clean(command.updateItem.url).url : undefined,
      imageUrl: command.updateItem.pictureUrl,
      score: command.updateItem.score,
    })

    this.logger.log('Saving item...', { itemId: item.id, updatedItem })
    await this.itemRepository.save(updatedItem)
  }
}
