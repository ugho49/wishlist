import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { AddItemForListInputDto, AddItemInputDto, ItemDto } from '@wishlist/common-types';
import { WishlistRepository } from '../wishlist/wishlist.repository';
import { ItemEntity } from './item.entity';
import { toItemDto } from './item.mapper';

@Injectable()
export class ItemService {
  constructor(private readonly itemRepository: ItemRepository, private wishlistRepository: WishlistRepository) {}

  async create(param: { currentUserId: string; dto: AddItemForListInputDto }): Promise<ItemDto> {
    const { dto, currentUserId } = param;
    const wishlistEntity = await this.wishlistRepository.findByIdAndUserId({
      wishlistId: dto.wishlist_id,
      userId: currentUserId,
    });

    if (!wishlistEntity) {
      throw new NotFoundException('Wishlist not found');
    }

    const isSuggested = wishlistEntity.ownerId !== currentUserId;

    const itemEntity = ItemEntity.create({
      name: dto.name,
      description: dto.description,
      score: dto.score,
      url: dto.url,
      isSuggested,
      wishlistId: wishlistEntity.id,
    });

    await this.itemRepository.save(itemEntity);

    return toItemDto({ entity: itemEntity, displayUserAndSuggested: true });
  }

  async update(param: { itemId: string; currentUserId: string; dto: AddItemInputDto }): Promise<void> {
    const { itemId, dto, currentUserId } = param;
    const itemEntity = await this.itemRepository.findByIdAndUserIdOrFail({ itemId, userId: currentUserId });
    const wishlistEntity = await itemEntity.wishlist;
    const isOwnerOfList = wishlistEntity.ownerId === currentUserId;

    if (itemEntity.isSuggested && isOwnerOfList) {
      throw new NotFoundException('Item not found');
    }

    if (itemEntity.isSuggested && itemEntity.isTakenBySomeone() && itemEntity.takerId !== currentUserId) {
      throw new UnauthorizedException('You cannot update this item, is already take by someone else');
    }

    if (itemEntity.isNotSuggested() && !isOwnerOfList) {
      throw new UnauthorizedException('You cannot update this item, only the creator of the list can');
    }

    await this.itemRepository.updateById(itemId, {
      name: dto.name,
      description: dto.description,
      url: dto.url,
      score: dto.score,
    });
  }

  async deleteItem(param: { itemId: string; currentUserId: string }): Promise<void> {
    const { itemId, currentUserId } = param;
    const itemEntity = await this.itemRepository.findByIdAndUserIdOrFail({ itemId, userId: currentUserId });
    const wishlistEntity = await itemEntity.wishlist;
    const isOwnerOfList = wishlistEntity.ownerId === currentUserId;

    if (itemEntity.isSuggested && isOwnerOfList) {
      throw new NotFoundException('Item not found');
    }

    if (itemEntity.isSuggested && itemEntity.isTakenBySomeone() && itemEntity.takerId !== currentUserId) {
      throw new UnauthorizedException('You cannot delete this item, is already taken');
    }

    if (itemEntity.isNotSuggested() && !isOwnerOfList) {
      throw new UnauthorizedException('You cannot delete this item, only the creator of the list can');
    }

    if (!itemEntity.isSuggested && itemEntity.isTakenBySomeone()) {
      await this.itemRepository.updateById(itemId, { isSuggested: true });
      return;
    }

    await this.itemRepository.delete({ id: itemId });
  }

  async toggleItem(param: { itemId: string; currentUserId: string }): Promise<void> {
    const { itemId, currentUserId } = param;
    const itemEntity = await this.itemRepository.findByIdAndUserIdOrFail({ itemId, userId: currentUserId });
    const wishlistEntity = await itemEntity.wishlist;
    const hideItems = wishlistEntity.hideItems;
    const isOwnerOfList = wishlistEntity.ownerId === currentUserId;

    if (itemEntity.isTakenBySomeone()) {
      await this.uncheck({ itemEntity, isOwnerOfList, hideItems });
    } else {
      await this.check({ itemEntity, isOwnerOfList, currentUserId, hideItems });
    }
  }

  private async check(params: {
    currentUserId: string;
    itemEntity: ItemEntity;
    isOwnerOfList: boolean;
    hideItems: boolean;
  }): Promise<void> {
    const { itemEntity, hideItems, isOwnerOfList, currentUserId } = params;

    if (isOwnerOfList && hideItems) {
      if (itemEntity.isSuggested) {
        throw new NotFoundException('Item not found');
      }

      if (itemEntity.isNotSuggested()) {
        throw new UnauthorizedException('You cannot check your own items');
      }
    }

    await this.itemRepository.updateById(itemEntity.id, {
      takerId: currentUserId,
      takenAt: new Date(),
    });
  }

  private async uncheck(params: { itemEntity: ItemEntity; isOwnerOfList: boolean; hideItems: boolean }): Promise<void> {
    const { itemEntity, hideItems, isOwnerOfList } = params;

    if (isOwnerOfList && hideItems) {
      if (itemEntity.isSuggested) {
        throw new NotFoundException('Item not found');
      }

      if (itemEntity.isNotSuggested()) {
        throw new UnauthorizedException('You cannot uncheck your own items');
      }
    }

    await this.itemRepository.updateById(itemEntity.id, {
      takerId: null,
      takenAt: null,
    });
  }
}
