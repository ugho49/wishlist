import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { LegacyUserRepository, toMiniUserDto } from '@wishlist/api/user'
import { LegacyWishlistRepository } from '@wishlist/api/wishlist'
import {
  AddItemForListInputDto,
  ItemDto,
  ItemId,
  ToggleItemOutputDto,
  UpdateItemInputDto,
  UserId,
} from '@wishlist/common'
import { TidyURL } from 'tidy-url'

import { ItemEntity } from './item.entity'
import { toItemDto } from './item.mapper'
import { LegacyItemRepository } from './legacy-item-repository.service'

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: LegacyItemRepository,
    private wishlistRepository: LegacyWishlistRepository,
    private readonly userRepository: LegacyUserRepository,
  ) {}

  async create(param: { currentUserId: UserId; dto: AddItemForListInputDto }): Promise<ItemDto> {
    const { dto, currentUserId } = param
    const wishlistEntity = await this.wishlistRepository.findByIdAndUserId({
      wishlistId: dto.wishlist_id,
      userId: currentUserId,
    })

    if (!wishlistEntity) {
      throw new NotFoundException('Wishlist not found')
    }

    const isSuggested = wishlistEntity.ownerId !== currentUserId

    const itemEntity = ItemEntity.create({
      name: dto.name,
      description: dto.description,
      score: dto.score,
      url: dto.url ? TidyURL.clean(dto.url).url : undefined,
      pictureUrl: dto.picture_url,
      isSuggested,
      wishlistId: wishlistEntity.id,
    })

    await this.itemRepository.save(itemEntity)

    return toItemDto({ entity: itemEntity, displayUserAndSuggested: true })
  }

  async update(param: { itemId: ItemId; currentUserId: UserId; dto: UpdateItemInputDto }): Promise<void> {
    const { itemId, dto, currentUserId } = param
    const itemEntity = await this.itemRepository.findByIdAndUserIdOrFail({ itemId, userId: currentUserId })
    const wishlistEntity = await itemEntity.wishlist
    const isOwnerOfList = wishlistEntity.ownerId === currentUserId

    if (itemEntity.isSuggested && isOwnerOfList) {
      throw new NotFoundException('Item not found')
    }

    if (itemEntity.isSuggested && itemEntity.isTakenBySomeone() && itemEntity.takerId !== currentUserId) {
      throw new UnauthorizedException('You cannot update this item, is already take by someone else')
    }

    if (itemEntity.isNotSuggested() && !isOwnerOfList) {
      throw new UnauthorizedException('You cannot update this item, only the creator of the list can')
    }

    await this.itemRepository.updateById(itemId, {
      name: dto.name,
      description: dto.description || null,
      url: dto.url ? TidyURL.clean(dto.url).url : null,
      pictureUrl: dto.picture_url || null,
      score: dto.score || null,
    })
  }

  async deleteItem(param: { itemId: ItemId; currentUserId: UserId }): Promise<void> {
    const { itemId, currentUserId } = param
    const itemEntity = await this.itemRepository.findByIdAndUserIdOrFail({ itemId, userId: currentUserId })
    const wishlistEntity = await itemEntity.wishlist
    const isOwnerOfList = wishlistEntity.ownerId === currentUserId

    if (itemEntity.isSuggested && isOwnerOfList) {
      throw new NotFoundException('Item not found')
    }

    if (itemEntity.isSuggested && itemEntity.isTakenBySomeone() && itemEntity.takerId !== currentUserId) {
      throw new UnauthorizedException('You cannot delete this item, is already taken')
    }

    if (itemEntity.isNotSuggested() && !isOwnerOfList) {
      throw new UnauthorizedException('You cannot delete this item, only the creator of the list can')
    }

    if (!itemEntity.isSuggested && itemEntity.isTakenBySomeone()) {
      await this.itemRepository.updateById(itemId, { isSuggested: true })
      return
    }

    await this.itemRepository.delete({ id: itemId })
  }

  async toggleItem(param: { itemId: ItemId; currentUserId: UserId }): Promise<ToggleItemOutputDto> {
    const { itemId, currentUserId } = param
    const itemEntity = await this.itemRepository.findByIdAndUserIdOrFail({ itemId, userId: currentUserId })
    const wishlistEntity = await itemEntity.wishlist
    const hideItems = wishlistEntity.hideItems
    const isOwnerOfList = wishlistEntity.ownerId === currentUserId

    if (itemEntity.isTakenBySomeone()) {
      await this.uncheck({ itemEntity, isOwnerOfList, hideItems, currentUserId })
      return {}
    } else {
      const takenAt = await this.check({ itemEntity, isOwnerOfList, currentUserId, hideItems })
      const user = await this.userRepository.findById(currentUserId)
      return {
        taken_by: user ? toMiniUserDto(user) : undefined,
        taken_at: takenAt.toISOString(),
      }
    }
  }

  private async check(params: {
    currentUserId: UserId
    itemEntity: ItemEntity
    isOwnerOfList: boolean
    hideItems: boolean
  }): Promise<Date> {
    const { itemEntity, hideItems, isOwnerOfList, currentUserId } = params

    if (isOwnerOfList && hideItems) {
      if (itemEntity.isSuggested) {
        throw new NotFoundException('Item not found')
      }

      if (itemEntity.isNotSuggested()) {
        throw new UnauthorizedException('You cannot check your own items')
      }
    }

    const takenAt = new Date()

    await this.itemRepository.updateById(itemEntity.id, {
      takerId: currentUserId,
      takenAt,
    })

    return takenAt
  }

  private async uncheck(params: {
    itemEntity: ItemEntity
    isOwnerOfList: boolean
    hideItems: boolean
    currentUserId: string
  }): Promise<void> {
    const { itemEntity, hideItems, isOwnerOfList, currentUserId } = params

    if (itemEntity.takerId !== currentUserId) {
      throw new UnauthorizedException('You cannot uncheck this item, you are not the one who as check it')
    }

    if (isOwnerOfList && hideItems) {
      if (itemEntity.isSuggested) {
        throw new NotFoundException('Item not found')
      }

      if (itemEntity.isNotSuggested()) {
        throw new UnauthorizedException('You cannot uncheck your own items')
      }
    }

    await this.itemRepository.updateById(itemEntity.id, {
      takerId: null,
      takenAt: null,
    })
  }
}
