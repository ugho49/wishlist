import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { userMapper, UserRepository } from '@wishlist/api/user'
import { Wishlist, WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser } from '@wishlist/common'

import { WishlistItem, WishlistItemRepository } from '../../domain'
import { ToggleItemCommand, ToggleItemResult } from '../../domain/command/toggle-item.command'

@CommandHandler(ToggleItemCommand)
export class ToggleItemUseCase implements IInferredCommandHandler<ToggleItemCommand> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ToggleItemCommand): Promise<ToggleItemResult> {
    const item = await this.itemRepository.findByIdOrFail(command.itemId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: item.wishlistId,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot toggle this item, you are not the owner of the list or a participant')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(item.wishlistId)

    if (item.isTakenBySomeone()) {
      await this.uncheck({ item, wishlist, currentUser: command.currentUser })
      return {}
    }

    const updatedItem = await this.check({ item, wishlist, currentUser: command.currentUser })

    return {
      taken_by: userMapper.toMiniUserDto(updatedItem.takenBy!),
      taken_at: updatedItem.takenAt?.toISOString(),
    }
  }

  private async check(params: {
    item: WishlistItem
    wishlist: Wishlist
    currentUser: ICurrentUser
  }): Promise<WishlistItem> {
    const { item, currentUser, wishlist } = params

    if (wishlist.isOwner(currentUser.id) && wishlist.hideItems) {
      if (item.isSuggested) {
        throw new NotFoundException('Item not found')
      } else {
        throw new UnauthorizedException('You cannot check your own items')
      }
    }

    const user = await this.userRepository.findByIdOrFail(currentUser.id)
    const updatedItem = item.check(user)

    await this.itemRepository.save(updatedItem)

    return updatedItem
  }

  private async uncheck(params: { item: WishlistItem; wishlist: Wishlist; currentUser: ICurrentUser }): Promise<void> {
    const { item, wishlist, currentUser } = params

    if (!item.isTakenBy(currentUser.id)) {
      throw new UnauthorizedException('You cannot uncheck this item, you are not the one who as check it')
    }

    if (wishlist.isOwner(currentUser.id) && wishlist.hideItems) {
      if (item.isSuggested) {
        throw new NotFoundException('Item not found')
      } else {
        throw new UnauthorizedException('You cannot uncheck your own items')
      }
    }

    const updatedItem = item.uncheck()

    await this.itemRepository.save(updatedItem)
  }
}
