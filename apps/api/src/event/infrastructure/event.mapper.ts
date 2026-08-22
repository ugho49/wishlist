import type { Wishlist } from '../../wishlist/domain/wishlist.model';
import type { Event } from '../domain/model/event.model';
import type { EventAttendee } from '../domain/model/event-attendee.model';

import { type AttendeeDto, AttendeeRole, type DetailedEventDto, type EventWithCountsDto } from '@wishlist/common';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  AttendeeRole as GqlAttendeeRole,
  type Event as GqlEvent,
  type EventAttendee as GqlEventAttendee,
} from '../../gql/generated-types';
import { wishlistMapper } from '../../wishlist/infrastructure/wishlist.mapper';
import { eventAttendeeMapper } from './event-attendee.mapper';
import { toMiniEventDto } from './event-mini.mapper';

function toDetailedEventDto(params: { event: Event; wishlists: Wishlist[] }): DetailedEventDto {
  const { event, wishlists } = params;

  return {
    ...toMiniEventDto(event),
    wishlists: wishlists.map(wishlistMapper.toWishlistWithOwnerDto),
    attendees: event.attendees.map(eventAttendeeMapper.toAttendeeDto),
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
  };
}

function toEventWithCountsDto(event: Event): EventWithCountsDto {
  return {
    ...toMiniEventDto(event),
    nb_wishlists: event.wishlistIds.length,
    attendees: event.attendees.map(eventAttendeeMapper.toAttendeeDto),
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
  };
}

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
    attendeeIds: event.attendees.map(attendee => attendee.id),
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

function toGqlEventAttendeeFromDto(attendee: AttendeeDto): GqlEventAttendee {
  const role = match(attendee.role)
    .with(AttendeeRole.CREATOR, () => GqlAttendeeRole.Creator)
    .with(AttendeeRole.ADMIN, () => GqlAttendeeRole.Admin)
    .with(AttendeeRole.PARTICIPANT, () => GqlAttendeeRole.Participant)
    .exhaustive();

  return {
    __typename: 'EventAttendee',
    id: attendee.id,
    userId: attendee.user?.id,
    pendingEmail: attendee.pending_email,
    role,
  };
}

export const eventMapper = {
  toMiniEventDto,
  toDetailedEventDto,
  toEventWithCountsDto,
  toGqlEvent,
  toGqlEventAttendee,
  toGqlEventAttendeeFromDto,
};
