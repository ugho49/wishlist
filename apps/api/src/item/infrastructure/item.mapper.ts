import type { ItemDto } from '@wishlist/common'
import type { WishlistItem } from '../domain'

import { userMapper } from '@wishlist/api/user'

import { Item as GqlItem } from '../../gql/generated-types'

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

function toGqlItem(param: { item: WishlistItem; displayUserAndSuggested: boolean }): GqlItem {
  const { displayUserAndSuggested, item } = param

  const dto: GqlItem = {
    __typename: 'Item',
    id: item.id,
    name: item.name,
    description: item.description,
    score: item.score,
    url: item.url,
    pictureUrl: item.imageUrl,
    createdAt: item.createdAt.toISOString(),
  }

  if (displayUserAndSuggested) {
    dto.isSuggested = item.isSuggested
    dto.takenById = item.takenBy ? item.takenBy.id : undefined
    dto.takenAt = item.takenAt?.toISOString()
  }

  return dto
}

function dtoToGqlItem(dto: ItemDto): GqlItem {
  return {
    __typename: 'Item',
    id: dto.id,
    name: dto.name,
    description: dto.description,
    score: dto.score,
    url: dto.url,
    pictureUrl: dto.picture_url,
    createdAt: dto.created_at,
    isSuggested: dto.is_suggested,
    takenById: dto.taken_by?.id,
    takenAt: dto.taken_at,
  }
}

export const itemMapper = {
  toDto,
  toGqlItem,
  dtoToGqlItem,
}
