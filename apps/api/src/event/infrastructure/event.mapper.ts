import type { Event } from '../domain/model/event.model';
import type { EventAttendee } from '../domain/model/event-attendee.model';

import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  AttendeeRole as GqlAttendeeRole,
  type Event as GqlEvent,
  type EventAttendee as GqlEventAttendee,
  type EventInvitePreview as GqlEventInvitePreview,
} from '../../gql/generated-types';
import { userMapper } from '../../user/infrastructure/user.mapper';
import { type EventInvitePreview } from '../application/query/get-event-invite-preview.use-case';
import { AttendeeRole } from '../domain/attendee-role.enum';

function toGqlEvent(event: Event): GqlEvent {
  return {
    __typename: 'Event',
    id: event.id,
    title: event.title,
    description: event.description,
    icon: event.icon,
    eventDate: DateTime.fromJSDate(event.eventDate).toISODate() || '',
    inviteToken: event.inviteToken,
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
    user: eventAttendee.user ? userMapper.toGqlUser(eventAttendee.user) : undefined,
    pendingEmail: eventAttendee.pendingEmail,
    role,
  };
}

function toGqlEventInvitePreview(preview: EventInvitePreview): GqlEventInvitePreview {
  return {
    __typename: 'EventInvitePreview',
    title: preview.title,
    description: preview.description,
    icon: preview.icon,
    eventDate: DateTime.fromJSDate(preview.eventDate).toISODate() || '',
    attendeeCount: preview.attendeeCount,
    hostDisplayName: preview.hostDisplayName,
    alreadyJoined: preview.alreadyJoined,
  };
}

export const eventMapper = {
  toGqlEvent,
  toGqlEventAttendee,
  toGqlEventInvitePreview,
};
