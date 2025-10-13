import type { Event, EventAttendee } from '@wishlist/api/event'
import type { SecretSantaDto, SecretSantaUserDto } from '@wishlist/common'
import type { SecretSanta, SecretSantaUser } from '../domain'

import { eventAttendeeMapper, eventMapper } from '@wishlist/api/event'

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

function toSecretSantaUserDto(model: SecretSantaUser, attendee: EventAttendee): SecretSantaUserDto {
  return {
    id: model.id,
    attendee: eventAttendeeMapper.toAttendeeDto(attendee),
    exclusions: model.exclusions,
  }
}

export const secretSantaMapper = {
  toSecretSantaDto,
  toSecretSantaUserDto,
}
