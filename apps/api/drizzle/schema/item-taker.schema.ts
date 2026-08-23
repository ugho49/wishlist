import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, primaryKey } from 'drizzle-orm/pg-core';

import { timestampWithTimezone } from '../helpers';
import { itemId, userId } from '../ids';
import { item } from './item.schema';
import { user } from './user.schema';

export const itemTaker = pgTable(
  'item_taker',
  {
    itemId: itemId('item_id').notNull(),
    userId: userId('user_id').notNull(),
    takenAt: timestampWithTimezone('taken_at').notNull(),
  },
  table => [
    primaryKey({ columns: [table.itemId, table.userId] }),
    foreignKey({ columns: [table.itemId], foreignColumns: [item.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.userId], foreignColumns: [user.id] }).onDelete('cascade'),
  ],
);

export const itemTakerRelations = relations(itemTaker, ({ one }) => ({
  item: one(item, {
    fields: [itemTaker.itemId],
    references: [item.id],
  }),
  user: one(user, {
    fields: [itemTaker.userId],
    references: [user.id],
  }),
}));
