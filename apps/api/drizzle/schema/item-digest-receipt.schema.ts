import { date, foreignKey, pgTable, primaryKey } from 'drizzle-orm/pg-core';

import { userId } from '../ids';
import { user } from './user.schema';

export const itemDigestReceipt = pgTable(
  'item_digest_receipt',
  {
    userId: userId('user_id').notNull(),
    digestDate: date('digest_date', { mode: 'string' }).notNull(),
  },
  table => [
    primaryKey({ columns: [table.userId, table.digestDate] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'item_digest_receipt_user_id_fkey',
    }).onDelete('cascade'),
  ],
);
