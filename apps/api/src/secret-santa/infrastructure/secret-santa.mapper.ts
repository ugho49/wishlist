import type { Event, EventAttendee } from '@wishlist/api/event'
import type { SecretSanta, SecretSantaUser } from '../domain'

import { eventAttendeeMapper, eventMapper } from '@wishlist/api/event'
import { type SecretSantaDto, SecretSantaStatus, type SecretSantaUserDto } from '@wishlist/common'
import { match } from 'ts-pattern'

import {
  SecretSanta as GqlSecretSanta,
  SecretSantaStatus as GqlSecretSantaStatus,
  SecretSantaUser as GqlSecretSantaUser,
} from '../../gql/generated-types'

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

function toGqlSecretSanta(secretSanta: SecretSanta): GqlSecretSanta {
  const status = match(secretSanta.status)
    .with(SecretSantaStatus.CREATED, () => GqlSecretSantaStatus.Created)
    .with(SecretSantaStatus.STARTED, () => GqlSecretSantaStatus.Started)
    .exhaustive()

  return {
    __typename: 'SecretSanta',
    id: secretSanta.id,
    description: secretSanta.description,
    budget: secretSanta.budget,
    status,
    eventId: secretSanta.eventId,
    createdAt: secretSanta.createdAt.toISOString(),
    updatedAt: secretSanta.updatedAt.toISOString(),
  }
}

function toSecretSantaUserDto(model: SecretSantaUser, attendee: EventAttendee): SecretSantaUserDto {
  return {
    id: model.id,
    attendee: eventAttendeeMapper.toAttendeeDto(attendee),
    exclusions: model.exclusions,
  }
}

function toGqlSecretSantaUser(model: SecretSantaUser): GqlSecretSantaUser {
  return {
    __typename: 'SecretSantaUser',
    id: model.id,
    attendeeId: model.attendeeId,
    exclusionIds: model.exclusions,
  }
}

export const secretSantaMapper = {
  toSecretSantaDto,
  toGqlSecretSanta,
  toSecretSantaUserDto,
  toGqlSecretSantaUser,
}
