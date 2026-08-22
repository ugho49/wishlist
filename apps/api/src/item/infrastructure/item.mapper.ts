import type { ItemDto, ItemTakerDto } from '@wishlist/common'
import type { WishlistItem } from '../domain'

import { userMapper } from '@wishlist/api/user'

import { type Item as GqlItem, type ItemTaker as GqlItemTaker } from '../../gql/generated-types'

function toTakerDtos(item: WishlistItem): ItemTakerDto[] {
  return item.takers.map(taker => ({
    user: userMapper.toMiniUserDto(taker.user),
    taken_at: taker.takenAt.toISOString(),
  }))
}

function toGqlTakers(item: WishlistItem): GqlItemTaker[] {
  return item.takers.map(taker => ({
    __typename: 'ItemTaker',
    userId: taker.user.id,
    takenAt: taker.takenAt.toISOString(),
  }))
}

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
    dto.takers = toTakerDtos(item)
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
    takers: [],
  }

  if (displayUserAndSuggested) {
    dto.isSuggested = item.isSuggested
    dto.takers = toGqlTakers(item)
  }

  return dto
}

export const itemMapper = {
  toDto,
  toGqlItem,
  toGqlTakers,
}
