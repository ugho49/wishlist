import type { Event } from '../domain/model/event.model';
import type { EventAttendee } from '../domain/model/event-attendee.model';

import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  AttendeeRole as GqlAttendeeRole,
  type Event as GqlEvent,
  type EventAttendee as GqlEventAttendee,
} from '../../gql/generated-types';
import { AttendeeRole } from '../domain/attendee-role.enum';

function toGqlEvent(event: Event): GqlEvent {
  return {
    __typename: 'Event',
    id: event.id,
    title: event.title,
    description: event.description,
    icon: event.icon,
    eventDate: DateTime.fromJSDate(event.eventDate).toISODate() || '',
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    wishlistIds: event.wishlistIds,
    attendees: event.attendees.map(attendee => toGqlEventAttendee(attendee)),
  };
}

function toGqlEventAttendee(eventAttendee: EventAttendee): GqlEventAttendee {
  const role = match(eventAttendee.role)
    .with(AttendeeRole.CREATOR, () => GqlAttendeeRole.Creator)
    .with(AttendeeRole.ADMIN, () => GqlAttendeeRole.Admin)
    .with(AttendeeRole.PARTICIPANT, () => GqlAttendeeRole.Participant)
    .exhaustive();

  return {
    __typename: 'EventAttendee',
    id: eventAttendee.id,
    userId: eventAttendee.user?.id,
    pendingEmail: eventAttendee.pendingEmail,
    role,
  };
}

export const eventMapper = {
  toGqlEvent,
  toGqlEventAttendee,
};
