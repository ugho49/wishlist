import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository, userMapper } from '@wishlist/api/user'
import { Wishlist, WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, ItemId, ToggleItemOutputDto } from '@wishlist/common'

import { WishlistItem, WishlistItemRepository } from '../../domain'

export type ToggleItemInput = {
  currentUser: ICurrentUser
  itemId: ItemId
}

@Injectable()
export class ToggleItemUseCase {
  private readonly logger = new Logger(ToggleItemUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ToggleItemInput): Promise<ToggleItemOutputDto> {
    this.logger.log('Toggle item request received', { command })
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
    this.logger.log('Checking item...', { itemId: params.item.id })
    const { item, currentUser, wishlist } = params

    if (wishlist.isOwner(currentUser.id) && wishlist.hideItems) {
      if (item.isSuggested) {
        throw new NotFoundException('Item not found')
      }

      throw new UnauthorizedException('You cannot check your own items')
    }

    const user = await this.userRepository.findByIdOrFail(currentUser.id)
    const updatedItem = item.check(user)

    await this.itemRepository.save(updatedItem)

    return updatedItem
  }

  private async uncheck(params: { item: WishlistItem; wishlist: Wishlist; currentUser: ICurrentUser }): Promise<void> {
    this.logger.log('Unchecking item...', { itemId: params.item.id })
    const { item, wishlist, currentUser } = params

    if (!item.isTakenBy(currentUser.id)) {
      throw new UnauthorizedException('You cannot uncheck this item, you are not the one who as check it')
    }

    if (wishlist.isOwner(currentUser.id) && wishlist.hideItems) {
      if (item.isSuggested) {
        throw new NotFoundException('Item not found')
      }

      throw new UnauthorizedException('You cannot uncheck your own items')
    }

    const updatedItem = item.uncheck()

    await this.itemRepository.save(updatedItem)
  }
}
