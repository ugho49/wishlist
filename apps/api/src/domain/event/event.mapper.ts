import { DetailedEventDto, EventWithCountsDto, MiniEventDto } from '@wishlist/common-types'
import { DateTime } from 'luxon'

import { toAttendeeDto } from '../attendee/attendee.mapper'
import { toMiniUserDto } from '../user/user.mapper'
import { toWishlistWithOwnerDto } from '../wishlist/wishlist.mapper'
import { EventEntity } from './event.entity'

export function toMiniEventDto(entity: EventEntity): MiniEventDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description || undefined,
    event_date: DateTime.fromJSDate(entity.eventDate).toISODate() || '',
  }
}

export async function toEventWithCountsDto(entity: EventEntity): Promise<EventWithCountsDto> {
  const [wishlists, attendees, creator] = await Promise.all([entity.wishlists, entity.attendees, entity.creator])
  const attendeesDto = await Promise.all(attendees.map(attendee => toAttendeeDto(attendee)))

  return {
    ...toMiniEventDto(entity),
    created_by: toMiniUserDto(creator),
    nb_wishlists: wishlists.length,
    attendees: attendeesDto,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}

export async function toDetailedEventDto(entity: EventEntity): Promise<DetailedEventDto> {
  const [wishlists, attendees, creator] = await Promise.all([entity.wishlists, entity.attendees, entity.creator])

  const wishlistsDto = await Promise.all(wishlists.map(wishlist => toWishlistWithOwnerDto(wishlist)))
  const attendeesDto = await Promise.all(attendees.map(attendee => toAttendeeDto(attendee)))

  return {
    ...toMiniEventDto(entity),
    created_by: toMiniUserDto(creator),
    wishlists: wishlistsDto,
    attendees: attendeesDto,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}
