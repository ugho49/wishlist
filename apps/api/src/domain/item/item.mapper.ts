import type { ItemDto } from '@wishlist/common-types'

import type { ItemEntity } from './item.entity'

import { toMiniUserDto } from '../user/user.mapper'

export async function toItemDto(param: { entity: ItemEntity; displayUserAndSuggested: boolean }): Promise<ItemDto> {
  const { displayUserAndSuggested, entity } = param
  const user = entity.taker ? await entity.taker : null

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description || undefined,
    score: entity.score || undefined,
    url: entity.url || undefined,
    picture_url: entity.pictureUrl || undefined,
    is_suggested: displayUserAndSuggested ? entity.isSuggested : undefined,
    taken_by: displayUserAndSuggested && user ? toMiniUserDto(user) : undefined,
    taken_at: displayUserAndSuggested ? entity.takenAt?.toISOString() : undefined,
    created_at: entity.createdAt.toISOString(),
  }
}
