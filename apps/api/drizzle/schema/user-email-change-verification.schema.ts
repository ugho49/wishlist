import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps, timestampWithTimezone } from '../helpers';
import { userEmailChangeVerificationId, userId } from '../ids';
import { user } from './user.schema';

export const userEmailChangeVerification = pgTable(
  'user_email_change_verification',
  {
    id: userEmailChangeVerificationId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    newEmail: varchar('new_email', { length: 200 }).notNull(),
    token: varchar({ length: 200 }).notNull(),
    expiredAt: timestampWithTimezone('expired_at').notNull(),
    ...timestamps,
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_email_change_verification_user_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const userEmailChangeVerificationRelations = relations(userEmailChangeVerification, ({ one }) => ({
  user: one(user, {
    fields: [userEmailChangeVerification.userId],
    references: [user.id],
  }),
}));
