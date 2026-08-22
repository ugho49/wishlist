import { relations } from 'drizzle-orm';
import { boolean, foreignKey, pgTable, unique } from 'drizzle-orm/pg-core';

import { timestamps } from '../helpers';
import { userEmailSettingId, userId } from '../ids';
import { user } from './user.schema';

export const userEmailSetting = pgTable(
  'user_email_setting',
  {
    id: userEmailSettingId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    dailyNewItemNotification: boolean('daily_new_item_notification').default(true).notNull(),
    ...timestamps,
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_email_setting_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_email_setting_user_id_key').on(table.userId),
  ],
);

export const userEmailSettingRelations = relations(userEmailSetting, ({ one }) => ({
  user: one(user, {
    fields: [userEmailSetting.userId],
    references: [user.id],
  }),
}));
