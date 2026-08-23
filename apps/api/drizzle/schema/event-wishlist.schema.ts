import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, primaryKey } from 'drizzle-orm/pg-core';

import { eventId, wishlistId } from '../ids';
import { event } from './event.schema';
import { wishlist } from './wishlist.schema';

export const eventWishlist = pgTable(
  'event_wishlist',
  {
    eventId: eventId('event_id').notNull(),
    wishlistId: wishlistId('wishlist_id').notNull(),
  },
  table => [
    primaryKey({ columns: [table.eventId, table.wishlistId] }),
    foreignKey({ columns: [table.wishlistId], foreignColumns: [wishlist.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.eventId], foreignColumns: [event.id] }).onDelete('cascade'),
  ],
);

export const eventWishlistRelations = relations(eventWishlist, ({ one }) => ({
  wishlist: one(wishlist, {
    fields: [eventWishlist.wishlistId],
    references: [wishlist.id],
  }),
  event: one(event, {
    fields: [eventWishlist.eventId],
    references: [event.id],
  }),
}));
