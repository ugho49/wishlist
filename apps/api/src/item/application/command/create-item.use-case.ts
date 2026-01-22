import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { WishlistItem, WishlistItemRepository } from '@wishlist/api/item'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, ItemDto, WishlistId } from '@wishlist/common'
import { TidyURL } from 'tidy-url'

import { itemMapper } from '../../infrastructure'

export type CreateItemInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
  newItem: {
    name: string
    description?: string
    score?: number
    url?: string
    pictureUrl?: string
  }
}

@Injectable()
export class CreateItemUseCase {
  private readonly logger = new Logger(CreateItemUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.WISHLIST_ITEM)
    private readonly itemRepository: WishlistItemRepository,
  ) {}

  async execute(command: CreateItemInput): Promise<ItemDto> {
    this.logger.log('Create item request received', { command })
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: wishlist.id,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot add items to this wishlist')
    }

    const isSuggested = !wishlist.isOwnerOrCoOwner(command.currentUser.id)
    const url = command.newItem.url ? TidyURL.clean(command.newItem.url).url : undefined

    const item = WishlistItem.create({
      id: this.itemRepository.newId(),
      wishlistId: wishlist.id,
      name: command.newItem.name,
      description: command.newItem.description,
      score: command.newItem.score,
      url,
      imageUrl: command.newItem.pictureUrl,
      isSuggested,
    })

    this.logger.log('Saving item...', { item })
    await this.itemRepository.save(item)

    return itemMapper.toDto({ item, displayUserAndSuggested: true })
  }
}
