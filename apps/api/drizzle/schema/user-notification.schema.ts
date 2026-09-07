import { relations } from 'drizzle-orm';
import { foreignKey, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { UserNotificationType } from '../../src/notification/domain/user-notification-type.enum';
import { tsEnumToPgEnum } from '../enum';
import { timestamps } from '../helpers';
import { eventId, itemId, userId, userNotificationId, wishlistId } from '../ids';
import { user } from './user.schema';

export const userNotificationTypeEnum = pgEnum('user_notification_type', tsEnumToPgEnum(UserNotificationType));

export const userNotification = pgTable(
  'user_notification',
  {
    id: userNotificationId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    type: userNotificationTypeEnum().notNull(),
    title: varchar({ length: 200 }).notNull(),
    body: varchar({ length: 500 }).notNull(),
    eventId: eventId('event_id'),
    wishlistId: wishlistId('wishlist_id'),
    itemId: itemId('item_id'),
    readAt: timestamp('read_at', { withTimezone: true }),
    ...timestamps,
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_notification_user_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const userNotificationRelations = relations(userNotification, ({ one }) => ({
  user: one(user, {
    fields: [userNotification.userId],
    references: [user.id],
  }),
}));
