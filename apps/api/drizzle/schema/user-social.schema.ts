import { relations } from 'drizzle-orm';
import { foreignKey, pgEnum, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { UserSocialType } from '../../src/user/domain/user-social-type.enum';
import { tsEnumToPgEnum } from '../enum';
import { timestamps } from '../helpers';
import { userId, userSocialId } from '../ids';
import { user } from './user.schema';

export const userSocialTypeEnum = pgEnum('user_social_type', tsEnumToPgEnum(UserSocialType));

export const userSocial = pgTable(
  'user_social',
  {
    id: userSocialId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    email: varchar({ length: 200 }).notNull(),
    name: varchar({ length: 200 }),
    socialId: varchar('social_id', { length: 1000 }).notNull(),
    socialType: userSocialTypeEnum('social_type').notNull(),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    ...timestamps,
  },
  table => [
    foreignKey({ columns: [table.userId], foreignColumns: [user.id], name: 'user_social_user_id_fkey' }).onDelete(
      'cascade',
    ),
    unique('user_social_user_id_social_type_key').on(table.userId, table.socialType),
    unique('user_social_social_id_social_type_key').on(table.socialId, table.socialType),
  ],
);

export const userSocialRelations = relations(userSocial, ({ one }) => ({
  user: one(user, {
    fields: [userSocial.userId],
    references: [user.id],
  }),
}));
