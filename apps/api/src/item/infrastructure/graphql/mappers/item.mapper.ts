import type { ItemDto, ToggleItemOutputDto } from '@wishlist/common'
import type { ItemObject, ToggleItemResultObject } from '../types'

import { userGraphQLMapper } from '../../../../user/infrastructure/graphql'

export const itemGraphQLMapper = {
  toItemObject(dto: ItemDto): ItemObject {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      url: dto.url,
      score: dto.score,
      isSuggested: dto.is_suggested,
      pictureUrl: dto.picture_url,
      takenBy: dto.taken_by ? userGraphQLMapper.toMiniUserObject(dto.taken_by) : undefined,
      takenAt: dto.taken_at,
      createdAt: dto.created_at,
    }
  },

  toToggleItemResultObject(dto: ToggleItemOutputDto): ToggleItemResultObject {
    return {
      takenBy: dto.taken_by ? userGraphQLMapper.toMiniUserObject(dto.taken_by) : undefined,
      takenAt: dto.taken_at,
    }
  },
}
