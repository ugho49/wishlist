import type { EventAttendee } from '../domain'

import { userMapper } from '@wishlist/api/user'
import { type AttendeeDto, AttendeeRole } from '@wishlist/common'
import { match } from 'ts-pattern'

import { AttendeeRole as GqlAttendeeRole, EventAttendee as GqlEventAttendee } from '../../gql/generated-types'

function toAttendeeDto(model: EventAttendee): AttendeeDto {
  return {
    id: model.id,
    user: model.user ? userMapper.toMiniUserDto(model.user) : undefined,
    pending_email: model.pendingEmail,
    role: model.role,
  }
}

function toGqlEventAttendee(eventAttendee: EventAttendee): GqlEventAttendee {
  const role = match(eventAttendee.role)
    .with(AttendeeRole.MAINTAINER, () => GqlAttendeeRole.Maintainer)
    .with(AttendeeRole.USER, () => GqlAttendeeRole.User)
    .exhaustive()

  return {
    __typename: 'EventAttendee',
    id: eventAttendee.id,
    userId: eventAttendee.user?.id,
    pendingEmail: eventAttendee.pendingEmail,
    role,
  }
}

export const eventAttendeeMapper = {
  toAttendeeDto,
  toGqlEventAttendee,
}
