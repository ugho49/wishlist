import type { Wishlist } from '@wishlist/api/wishlist'
import type { Event, EventAttendee } from '../domain'

import { wishlistMapper } from '@wishlist/api/wishlist'
import { AttendeeRole, type DetailedEventDto, type EventWithCountsDto, type MiniEventDto } from '@wishlist/common'
import { DateTime } from 'luxon'
import { match } from 'ts-pattern'

import {
  AttendeeRole as GqlAttendeeRole,
  Event as GqlEvent,
  EventAttendee as GqlEventAttendee,
} from '../../gql/generated-types'
import { eventAttendeeMapper } from './event-attendee.mapper'

function toMiniEventDto(event: Event): MiniEventDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    icon: event.icon,
    event_date: DateTime.fromJSDate(event.eventDate).toISODate() || '',
  }
}

function toDetailedEventDto(params: { event: Event; wishlists: Wishlist[] }): DetailedEventDto {
  const { event, wishlists } = params

  return {
    ...toMiniEventDto(event),
    wishlists: wishlists.map(wishlistMapper.toWishlistWithOwnerDto),
    attendees: event.attendees.map(eventAttendeeMapper.toAttendeeDto),
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
  }
}

function toEventWithCountsDto(event: Event): EventWithCountsDto {
  return {
    ...toMiniEventDto(event),
    nb_wishlists: event.wishlistIds.length,
    attendees: event.attendees.map(eventAttendeeMapper.toAttendeeDto),
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
  }
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

export const eventMapper = {
  toMiniEventDto,
  toDetailedEventDto,
  toEventWithCountsDto,
  toGqlEvent,
  toGqlEventAttendee,
}
