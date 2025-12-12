import type { SecretSantaDto, SecretSantaUserDto } from '@wishlist/common'
import type { SecretSantaObject, SecretSantaUserObject } from '../types'

import { eventGraphQLMapper } from '../../../../event/infrastructure/graphql'

export const secretSantaGraphQLMapper = {
  toSecretSantaUserObject(dto: SecretSantaUserDto): SecretSantaUserObject {
    return {
      id: dto.id,
      attendee: eventGraphQLMapper.toAttendeeObject(dto.attendee),
      exclusions: dto.exclusions,
    }
  },

  toSecretSantaObject(dto: SecretSantaDto): SecretSantaObject {
    return {
      id: dto.id,
      event: eventGraphQLMapper.toMiniEventObject(dto.event),
      description: dto.description,
      budget: dto.budget,
      status: dto.status,
      users: dto.users.map(u => secretSantaGraphQLMapper.toSecretSantaUserObject(u)),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },
}
