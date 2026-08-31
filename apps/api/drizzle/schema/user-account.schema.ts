import { relations, sql } from 'drizzle-orm';
import { foreignKey, pgEnum, pgTable, unique, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { UserAccountProvider } from '../../src/user/domain/user-account-provider.enum';
import { tsEnumToPgEnum } from '../enum';
import { timestamps } from '../helpers';
import { userAccountId, userId } from '../ids';
import { user } from './user.schema';

export const userAccountProviderEnum = pgEnum('user_account_provider', tsEnumToPgEnum(UserAccountProvider));

export const userAccount = pgTable(
  'user_account',
  {
    id: userAccountId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    provider: userAccountProviderEnum().notNull(),
    email: varchar({ length: 200 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 1000 }),
    passwordHash: varchar('password_hash', { length: 500 }),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    ...timestamps,
  },
  table => [
    foreignKey({ columns: [table.userId], foreignColumns: [user.id], name: 'user_account_user_id_fkey' }).onDelete(
      'cascade',
    ),
    unique('user_account_user_id_provider_key').on(table.userId, table.provider),
    uniqueIndex('user_account_provider_provider_account_id_key')
      .on(table.provider, table.providerAccountId)
      .where(sql`${table.providerAccountId} IS NOT NULL`),
  ],
);

export const userAccountRelations = relations(userAccount, ({ one }) => ({
  user: one(user, {
    fields: [userAccount.userId],
    references: [user.id],
  }),
}));
