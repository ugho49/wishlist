import { DetailledEventDto, EventWithCountsDto, MiniEventDto } from '@wishlist/common-types';
import { EventEntity } from '../entities/event.entity';
import { toMiniUserDto } from '../../user/user.mapper';
import { toAttendeeDto } from './attendee.mapper';
import { toWishlistWithOwnerDto } from '../../wishlist/wishlist.mapper';
import { DateTime } from 'luxon';

export function toMiniEventDto(entity: EventEntity): MiniEventDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    event_date: DateTime.fromJSDate(entity.eventDate).toISODate(),
  };
}

export async function toEventWithCountsDtoDto(entity: EventEntity): Promise<EventWithCountsDto> {
  const [wishlists, attendees] = await Promise.all([entity.wishlists, entity.attendees]);

  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    event_date: DateTime.fromJSDate(entity.eventDate).toISODate(),
    nb_wishlists: wishlists.length,
    nb_attendees: attendees.length,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

export async function toDetailledEventDto(entity: EventEntity): Promise<DetailledEventDto> {
  const [wishlists, attendees, creator] = await Promise.all([entity.wishlists, entity.attendees, entity.creator]);

  const wishlistsDto = await Promise.all(wishlists.map((wishlist) => toWishlistWithOwnerDto(wishlist)));
  const attendeesDto = await Promise.all(attendees.map((attendee) => toAttendeeDto(attendee)));

  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    event_date: DateTime.fromJSDate(entity.eventDate).toISODate(),
    created_by: toMiniUserDto(creator),
    wishlists: wishlistsDto,
    attendees: attendeesDto,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
