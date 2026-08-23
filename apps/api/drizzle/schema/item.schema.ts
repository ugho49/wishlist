import { relations, sql } from 'drizzle-orm';
import { boolean, check, foreignKey, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../helpers';
import { itemId, wishlistId } from '../ids';
import { itemTaker } from './item-taker.schema';
import { wishlist } from './wishlist.schema';

export const item = pgTable(
  'item',
  {
    id: itemId().primaryKey().notNull(),
    wishlistId: wishlistId('wishlist_id').notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    url: varchar({ length: 1000 }),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    isSuggested: boolean('is_suggested').default(false).notNull(),
    score: integer(),
    importSourceId: itemId('import_source_id'),
    ...timestamps,
  },
  table => [
    foreignKey({ columns: [table.wishlistId], foreignColumns: [wishlist.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.importSourceId], foreignColumns: [table.id] }).onDelete('set null'),
    check('chk_import_source_id', sql`import_source_id IS DISTINCT FROM id`),
  ],
);

export const itemRelations = relations(item, ({ one, many }) => ({
  wishlist: one(wishlist, {
    fields: [item.wishlistId],
    references: [wishlist.id],
  }),
  takers: many(itemTaker),
}));
