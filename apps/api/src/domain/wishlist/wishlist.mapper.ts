import {
  DetailedWishlistDto,
  MiniWishlistDto,
  WishlistWithEventsDto,
  WishlistWithOwnerDto,
} from '@wishlist/common-types';
import { WishlistEntity } from './wishlist.entity';
import { toMiniUserDto } from '../user/user.mapper';
import { toMiniEventDto } from '../event/mappers/event.mapper';
import { toItemDto } from '../item/item.mapper';

function getConfig(entity: WishlistEntity) {
  return { hideItems: entity.hideItems };
}

export function toMiniWishlistDto(entity: WishlistEntity): MiniWishlistDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
  };
}

export async function toDetailedWishlistDto(param: {
  entity: WishlistEntity;
  currentUserId: string;
}): Promise<DetailedWishlistDto> {
  const { currentUserId, entity } = param;
  const [owner, events, itemEntities] = await Promise.all([entity.owner, entity.events, entity.items]);

  // TODO: Filter to get only item you need to see
  const items = await Promise.all(itemEntities.map((item) => toItemDto(item)));

  return {
    ...toMiniWishlistDto(entity),
    owner: toMiniUserDto(owner),
    items,
    events: events.map((event) => toMiniEventDto(event)),
    config: getConfig(entity),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

export async function toWishlistWithEventsDto(entity: WishlistEntity): Promise<WishlistWithEventsDto> {
  const events = await entity.events;

  return {
    ...toMiniWishlistDto(entity),
    config: getConfig(entity),
    events: events.map((event) => toMiniEventDto(event)),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

export async function toWishlistWithOwnerDto(entity: WishlistEntity): Promise<WishlistWithOwnerDto> {
  const owner = await entity.owner;

  return {
    ...toMiniWishlistDto(entity),
    config: getConfig(entity),
    owner: toMiniUserDto(owner),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
