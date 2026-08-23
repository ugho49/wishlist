import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps, timestampWithTimezone } from '../helpers';
import { userId, userPasswordVerificationId } from '../ids';
import { user } from './user.schema';

export const userPasswordVerification = pgTable(
  'user_password_verification',
  {
    id: userPasswordVerificationId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    token: varchar({ length: 200 }).notNull(),
    expiredAt: timestampWithTimezone('expired_at').notNull(),
    ...timestamps,
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_password_verification_user_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const userPasswordVerificationRelations = relations(userPasswordVerification, ({ one }) => ({
  user: one(user, {
    fields: [userPasswordVerification.userId],
    references: [user.id],
  }),
}));
