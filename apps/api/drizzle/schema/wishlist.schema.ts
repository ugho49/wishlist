import { relations, sql } from 'drizzle-orm';
import { boolean, check, foreignKey, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../helpers';
import { userId, wishlistId } from '../ids';
import { eventWishlist } from './event-wishlist.schema';
import { item } from './item.schema';
import { user } from './user.schema';

export const wishlist = pgTable(
  'wishlist',
  {
    id: wishlistId().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    description: text(),
    ownerId: userId('owner_id').notNull(),
    coOwnerId: userId('co_owner_id'),
    hideItems: boolean('hide_items').default(true).notNull(),
    logoUrl: varchar('logo_url', { length: 1000 }),
    ...timestamps,
  },
  table => [
    foreignKey({ columns: [table.ownerId], foreignColumns: [user.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.coOwnerId], foreignColumns: [user.id] }).onDelete('set null'),
    check('chk_co_owner', sql`co_owner_id IS DISTINCT FROM owner_id`),
  ],
);

export const wishlistRelations = relations(wishlist, ({ one, many }) => ({
  owner: one(user, {
    fields: [wishlist.ownerId],
    references: [user.id],
    relationName: 'ownedWishlists',
  }),
  coOwner: one(user, {
    fields: [wishlist.coOwnerId],
    references: [user.id],
    relationName: 'coOwnedWishlists',
  }),
  items: many(item),
  eventWishlists: many(eventWishlist),
}));
