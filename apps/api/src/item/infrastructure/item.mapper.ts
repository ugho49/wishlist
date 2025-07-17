import type { ItemDto } from '@wishlist/common'

import type { WishlistItem } from '../domain'

import { userMapper } from '@wishlist/api/user'

function toDto(param: { item: WishlistItem; displayUserAndSuggested: boolean }): ItemDto {
  const { displayUserAndSuggested, item } = param

  const dto: ItemDto = {
    id: item.id,
    name: item.name,
    description: item.description,
    score: item.score,
    url: item.url,
    picture_url: item.imageUrl,
    created_at: item.createdAt.toISOString(),
  }

  if (displayUserAndSuggested) {
    dto.is_suggested = item.isSuggested
    dto.taken_by = item.takenBy ? userMapper.toMiniUserDto(item.takenBy) : undefined
    dto.taken_at = item.takenAt?.toISOString()
  }

  return dto
}

export const itemMapper = {
  toDto,
}
