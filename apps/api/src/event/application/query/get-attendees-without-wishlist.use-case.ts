import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { EventRepository } from '../../domain/repository/event.repository';

import { type EventId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { EventAttendee } from '../../domain/model/event-attendee.model';

export type GetAttendeesWithoutWishlistInput = {
  eventIds: EventId[];
};

export type GetAttendeesWithoutWishlistOutput = Array<{
  eventId: EventId;
  attendees: EventAttendee[];
}>;

/**
 * The attendees of each event who have not filled a wishlist for it yet. The caller already checked the events can
 * be seen: their participants see every list of the event anyway.
 */
@Injectable()
export class GetAttendeesWithoutWishlistUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: GetAttendeesWithoutWishlistInput): Promise<GetAttendeesWithoutWishlistOutput> {
    if (input.eventIds.length === 0) return [];

    const [events, filledWishlists] = await Promise.all([
      this.eventRepository.findByIds(input.eventIds),
      this.wishlistRepository.findFilledByEventIds(input.eventIds),
    ]);

    return events.map(event => ({
      eventId: event.id,
      attendees: event.attendeesWithoutWishlist(filledWishlists),
    }));
  }
}
