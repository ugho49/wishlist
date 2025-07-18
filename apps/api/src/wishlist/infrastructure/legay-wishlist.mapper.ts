import type { WishlistWithOwnerDto } from '@wishlist/common'

import type { WishlistEntity } from './legacy-wishlist.entity'

import { toMiniUserDto } from '../../user'

export async function toWishlistWithOwnerDto(entity: WishlistEntity): Promise<WishlistWithOwnerDto> {
  const owner = await entity.owner

  return {
    id: entity.id,
    title: entity.title,
    description: entity.description || undefined,
    logo_url: entity.logoUrl || undefined,
    config: { hide_items: entity.hideItems },
    owner: toMiniUserDto(owner),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}
