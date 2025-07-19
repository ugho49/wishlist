import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { WishlistItem, WishlistItemRepository } from '@wishlist/api/item'
import { WISHLIST_ITEM_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { TidyURL } from 'tidy-url'

import { CreateItemCommand, CreateItemResult } from '../../domain'
import { itemMapper } from '../../infrastructure'

@CommandHandler(CreateItemCommand)
export class CreateItemUseCase implements IInferredCommandHandler<CreateItemCommand> {
  constructor(
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(WISHLIST_ITEM_REPOSITORY)
    private readonly itemRepository: WishlistItemRepository,
  ) {}

  async execute(command: CreateItemCommand): Promise<CreateItemResult> {
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: wishlist.id,
      userId: command.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot add items to this wishlist')
    }

    const isSuggested = !wishlist.isOwner(command.currentUser.id)
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

    await this.itemRepository.save(item)

    return itemMapper.toDto({ item, displayUserAndSuggested: true })
  }
}
