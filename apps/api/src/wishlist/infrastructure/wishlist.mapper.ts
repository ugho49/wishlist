import type {
  DetailedWishlistDto,
  MiniWishlistDto,
  WishlistConfigDto,
  WishlistWithEventsDto,
  WishlistWithOwnerDto,
} from '@wishlist/common'

import type { WishlistEntity } from './wishlist.entity'

import { toMiniEventDto } from '../../event/infrastructure/legacy-event.mapper'
import { toItemDto } from '../../item/infrastructure/item.mapper'
import { displayItemSensitiveInformations, showItem } from '../../item/infrastructure/item.utils'
import { toMiniUserDto } from '../../user'

function getConfig(entity: WishlistEntity): WishlistConfigDto {
  return { hide_items: entity.hideItems }
}

export function toMiniWishlistDto(entity: WishlistEntity): MiniWishlistDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description || undefined,
    logo_url: entity.logoUrl || undefined,
  }
}

export async function toWishlistWithEventsDto(entity: WishlistEntity): Promise<WishlistWithEventsDto> {
  const events = await entity.events

  return {
    ...toMiniWishlistDto(entity),
    config: getConfig(entity),
    events: events.map(event => toMiniEventDto(event)),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}

export async function toWishlistWithOwnerDto(entity: WishlistEntity): Promise<WishlistWithOwnerDto> {
  const owner = await entity.owner

  return {
    ...toMiniWishlistDto(entity),
    config: getConfig(entity),
    owner: toMiniUserDto(owner),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}

export async function toDetailedWishlistDto(param: {
  entity: WishlistEntity
  currentUserId: string
}): Promise<DetailedWishlistDto> {
  const { currentUserId, entity } = param
  const [owner, events, itemEntities] = await Promise.all([entity.owner, entity.events, entity.items])

  const displayUserAndSuggested = displayItemSensitiveInformations({ wishlist: entity, currentUserId })

  const items = await Promise.all(
    itemEntities
      .filter(item => showItem({ item, wishlist: entity, currentUserId }))
      .map(item =>
        toItemDto({
          entity: item,
          displayUserAndSuggested,
        }),
      ),
  )

  return {
    ...toMiniWishlistDto(entity),
    owner: toMiniUserDto(owner),
    items,
    events: events.map(event => toMiniEventDto(event)),
    config: getConfig(entity),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}
