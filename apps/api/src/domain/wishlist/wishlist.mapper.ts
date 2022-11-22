import { DetailledWishlistDto, WishlistWithEventsDto } from '@wishlist/common-types';
import { WishlistEntity } from './wishlist.entity';
import { toMiniUserDto } from '../user/user.mapper';
import { toMiniEventDto } from '../event/event.mapper';

function getConfig(entity: WishlistEntity) {
  return { hideItems: entity.hideItems };
}

export async function toDetailledWishlistDto(entity: WishlistEntity): Promise<DetailledWishlistDto> {
  const owner = await entity.owner;
  const events = await entity.events;

  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
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
    id: entity.id,
    title: entity.title,
    description: entity.description,
    config: getConfig(entity),
    events: events.map((event) => toMiniEventDto(event)),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
