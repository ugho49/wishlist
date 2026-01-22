import type { Event } from '@wishlist/api/event'
import type { DetailedWishlistDto, UserId, WishlistWithEventsDto, WishlistWithOwnerDto } from '@wishlist/common'
import type { Wishlist } from '../domain'

import { eventMapper } from '@wishlist/api/event'
import { itemMapper } from '@wishlist/api/item'
import { userMapper } from '@wishlist/api/user'

import { GqlWishlist } from './wishlist.dto'

function toDetailedWishlistDto(params: {
  wishlist: Wishlist
  currentUserId: UserId
  events: Event[]
}): DetailedWishlistDto {
  const { wishlist, currentUserId, events } = params

  const displayUserAndSuggested = wishlist.canDisplayItemSensitiveInformations(currentUserId)

  return {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    logo_url: wishlist.logoUrl,
    owner: userMapper.toMiniUserDto(wishlist.owner),
    co_owner: wishlist.coOwner ? userMapper.toMiniUserDto(wishlist.coOwner) : undefined,
    items: wishlist.getItemsToDisplay(currentUserId).map(item => itemMapper.toDto({ item, displayUserAndSuggested })),
    events: events.map(eventMapper.toMiniEventDto),
    config: {
      hide_items: wishlist.hideItems,
    },
    created_at: wishlist.createdAt.toISOString(),
    updated_at: wishlist.updatedAt.toISOString(),
  }
}

function toWishlistWithEventsDto(params: { wishlist: Wishlist; events: Event[] }): WishlistWithEventsDto {
  const { wishlist, events } = params

  return {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    logo_url: wishlist.logoUrl,
    events: events.map(eventMapper.toMiniEventDto),
    config: { hide_items: wishlist.hideItems },
    owner: userMapper.toMiniUserDto(wishlist.owner),
    co_owner: wishlist.coOwner ? userMapper.toMiniUserDto(wishlist.coOwner) : undefined,
    created_at: wishlist.createdAt.toISOString(),
    updated_at: wishlist.updatedAt.toISOString(),
  }
}

function toWishlistWithOwnerDto(wishlist: Wishlist): WishlistWithOwnerDto {
  return {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    logo_url: wishlist.logoUrl,
    config: { hide_items: wishlist.hideItems },
    owner: userMapper.toMiniUserDto(wishlist.owner),
    co_owner: wishlist.coOwner ? userMapper.toMiniUserDto(wishlist.coOwner) : undefined,
    created_at: wishlist.createdAt.toISOString(),
    updated_at: wishlist.updatedAt.toISOString(),
  }
}

function toGqlWishlist(params: { wishlist: Wishlist; currentUserId: UserId }): GqlWishlist {
  const { wishlist, currentUserId } = params

  const displayUserAndSuggested = wishlist.canDisplayItemSensitiveInformations(currentUserId)

  return {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    logoUrl: wishlist.logoUrl,
    ownerId: wishlist.owner.id,
    coOwnerId: wishlist.coOwner?.id,
    eventIds: wishlist.eventIds,
    items: wishlist
      .getItemsToDisplay(currentUserId)
      .map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested })),
    config: { hideItems: wishlist.hideItems },
    createdAt: wishlist.createdAt.toISOString(),
    updatedAt: wishlist.updatedAt.toISOString(),
  }
}

export const wishlistMapper = {
  toDetailedWishlistDto,
  toWishlistWithEventsDto,
  toWishlistWithOwnerDto,
  toGqlWishlist,
}
