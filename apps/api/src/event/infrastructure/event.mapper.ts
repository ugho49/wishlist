import type { Wishlist } from '@wishlist/api/wishlist'
import type { DetailedEventDto, EventWithCountsDto, MiniEventDto } from '@wishlist/common'

import type { Event } from '../domain'

import { wishlistMapper } from '@wishlist/api/wishlist'
import { DateTime } from 'luxon'

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

export const eventMapper = {
  toMiniEventDto,
  toDetailedEventDto,
  toEventWithCountsDto,
}
