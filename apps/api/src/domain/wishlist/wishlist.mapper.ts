import {
  DetailledWishlistDto,
  MiniWishlistDto,
  WishlistWithEventsDto,
  WishlistWithOwnerDto,
} from '@wishlist/common-types';
import { WishlistEntity } from './wishlist.entity';
import { toMiniUserDto } from '../user/user.mapper';
import { toMiniEventDto } from '../event/mappers/event.mapper';

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

export async function toDetailledWishlistDto(entity: WishlistEntity): Promise<DetailledWishlistDto> {
  const [owner, events] = await Promise.all([entity.owner, entity.events]);

  return {
    ...toMiniWishlistDto(entity),
    owner: toMiniUserDto(owner),
    items: [], // TODO
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
