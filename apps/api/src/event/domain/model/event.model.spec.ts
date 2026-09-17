import type { EventId, WishlistId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { EventAttendeeBuilder } from '../../../../test-utils/builders/event-attendee.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { Event } from './event.model';
import { describe, expect, it } from 'bun:test';

describe('Event', () => {
  it('orders attendees with the creator first, then by id', () => {
    const eventId = uuid() as EventId;
    const creator = new EventAttendeeBuilder()
      .withEventId(eventId)
      .withUser(new UserBuilder().withEmail('creator@test.fr').build())
      .asCreator()
      .build();
    const alpha = new EventAttendeeBuilder()
      .withEventId(eventId)
      .withUser(new UserBuilder().withEmail('alpha@test.fr').build())
      .build();
    const beta = new EventAttendeeBuilder()
      .withEventId(eventId)
      .withUser(new UserBuilder().withEmail('beta@test.fr').build())
      .build();

    const event = new Event({
      id: eventId,
      title: 'Anniversaire',
      eventDate: new Date(),
      attendees: [beta, creator, alpha],
      wishlistIds: [] as WishlistId[],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(event.attendees[0]?.id).toBe(creator.id);
    expect(event.attendees.slice(1).map(attendee => attendee.id)).toEqual(
      [alpha.id, beta.id].toSorted((left, right) => left.localeCompare(right)),
    );
  });
});
