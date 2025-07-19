import type { Attendee } from '@wishlist/api/attendee'
import type { Event } from '@wishlist/api/event'
import type { SecretSantaDto, SecretSantaUserDto } from '@wishlist/common'

import type { SecretSanta, SecretSantaUser } from '../domain'

import { attendeeMapper } from '../../attendee/infrastructure/attendee.mapper'
import { eventMapper } from '../../event/infrastructure/event.mapper'

function toSecretSantaDto(model: SecretSanta, event: Event): SecretSantaDto {
  return {
    id: model.id,
    description: model.description,
    budget: model.budget,
    status: model.status,
    event: eventMapper.toMiniEventDto(event),
    users: model.users.map(user => toSecretSantaUserDto(user, event.attendees.find(a => a.id === user.attendeeId)!)),
    created_at: model.createdAt.toISOString(),
    updated_at: model.updatedAt.toISOString(),
  }
}

function toSecretSantaUserDto(model: SecretSantaUser, attendee: Attendee): SecretSantaUserDto {
  return {
    id: model.id,
    attendee: attendeeMapper.toAttendeeDto(attendee),
    exclusions: model.exclusions,
  }
}

export const secretSantaMapper = {
  toSecretSantaDto,
  toSecretSantaUserDto,
}
