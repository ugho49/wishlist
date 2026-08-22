import { relations } from 'drizzle-orm';
import { date, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../helpers';
import { eventId } from '../ids';
import { eventAttendee } from './event-attendee.schema';
import { eventWishlist } from './event-wishlist.schema';
import { secretSanta } from './secret-santa.schema';

export const event = pgTable('event', {
  id: eventId().primaryKey().notNull(),
  title: varchar({ length: 100 }).notNull(),
  description: text(),
  icon: varchar({ length: 10 }),
  eventDate: date('event_date').notNull(),
  ...timestamps,
});

export const eventRelations = relations(event, ({ many }) => ({
  attendees: many(eventAttendee),
  secretSantas: many(secretSanta),
  eventWishlists: many(eventWishlist),
}));
