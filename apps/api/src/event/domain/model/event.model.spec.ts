import type { EventId, WishlistId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { EventAttendeeBuilder } from '../../../../test-utils/builders/event-attendee.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { Event } from './event.model';
import { describe, expect, it } from 'bun:test';

const byText = (left: string, right: string) => left.localeCompare(right);

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

  describe('attendeesWithoutWishlist', () => {
    const creator = new UserBuilder().withEmail('creator@test.fr').build();
    const owner = new UserBuilder().withEmail('owner@test.fr').build();
    const coOwner = new UserBuilder().withEmail('co-owner@test.fr').build();
    const lazy = new UserBuilder().withEmail('lazy@test.fr').build();

    const event = new EventBuilder()
      .withCreator(creator)
      .withAttendee(owner)
      .withAttendee(coOwner)
      .withAttendee(lazy)
      .withPendingAttendee('pending@test.fr')
      .build();

    const emailsOf = (attendees: { getEmail(): string }[]) =>
      attendees.map(attendee => attendee.getEmail()).toSorted(byText);

    it('returns every attendee when no list is filled', () => {
      expect(emailsOf(event.attendeesWithoutWishlist([]))).toEqual(
        ['co-owner@test.fr', 'creator@test.fr', 'lazy@test.fr', 'owner@test.fr', 'pending@test.fr'].toSorted(byText),
      );
    });

    it('leaves out the owners and co-owners of the filled lists linked to the event', () => {
      const filledWishlists = [
        new WishlistBuilder().withOwner(owner).withEventIds([event.id]).build(),
        new WishlistBuilder().withOwner(creator).withCoOwner(coOwner).withEventIds([event.id]).build(),
      ];

      expect(emailsOf(event.attendeesWithoutWishlist(filledWishlists))).toEqual(['lazy@test.fr', 'pending@test.fr']);
    });

    it('ignores the filled lists of other events', () => {
      const otherEventId = uuid() as EventId;
      const filledWishlists = [new WishlistBuilder().withOwner(lazy).withEventIds([otherEventId]).build()];

      expect(emailsOf(event.attendeesWithoutWishlist(filledWishlists))).toContain('lazy@test.fr');
    });
  });
});
