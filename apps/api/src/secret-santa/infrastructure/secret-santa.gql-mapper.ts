import type { AttendeeDto, SecretSantaDto, SecretSantaUserDto } from '@wishlist/common'

import { AttendeeRole, SecretSantaStatus } from '@wishlist/common'
import { match } from 'ts-pattern'

import {
  AttendeeRole as GqlAttendeeRole,
  EventAttendee as GqlEventAttendee,
  SecretSanta as GqlSecretSanta,
  SecretSantaStatus as GqlSecretSantaStatus,
  SecretSantaUser as GqlSecretSantaUser,
} from '../../gql/generated-types'

function toGqlSecretSantaStatus(status: SecretSantaStatus): GqlSecretSantaStatus {
  return match(status)
    .with(SecretSantaStatus.CREATED, () => GqlSecretSantaStatus.Created)
    .with(SecretSantaStatus.STARTED, () => GqlSecretSantaStatus.Started)
    .exhaustive()
}

function toGqlSecretSantaUser(dto: SecretSantaUserDto): GqlSecretSantaUser {
  return {
    __typename: 'SecretSantaUser',
    id: dto.id,
    attendeeId: dto.attendee.id,
    exclusions: dto.exclusions,
  }
}

function toGqlSecretSanta(dto: SecretSantaDto): GqlSecretSanta {
  return {
    __typename: 'SecretSanta',
    id: dto.id,
    eventId: dto.event.id,
    description: dto.description,
    budget: dto.budget,
    status: toGqlSecretSantaStatus(dto.status),
    users: dto.users.map(toGqlSecretSantaUser),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

function toGqlSecretSantaDraw(attendee: AttendeeDto): GqlEventAttendee {
  const role = match(attendee.role)
    .with(AttendeeRole.MAINTAINER, () => GqlAttendeeRole.Maintainer)
    .with(AttendeeRole.USER, () => GqlAttendeeRole.User)
    .exhaustive()

  return {
    __typename: 'EventAttendee',
    id: attendee.id,
    userId: attendee.user?.id,
    pendingEmail: attendee.pending_email,
    role,
  }
}

export const secretSantaGqlMapper = {
  toGqlSecretSanta,
  toGqlSecretSantaUser,
  toGqlSecretSantaDraw,
}
