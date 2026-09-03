import { relations, sql } from 'drizzle-orm';
import { boolean, date, pgEnum, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { Authorities } from '../../src/user/domain/authorities.enum';
import { tsEnumToPgEnum } from '../enum';
import { timestamps } from '../helpers';
import { userId } from '../ids';
import { itemTaker } from './item-taker.schema';
import { userAccount } from './user-account.schema';
import { userEmailChangeVerification } from './user-email-change-verification.schema';
import { userEmailSetting } from './user-email-setting.schema';
import { userPasswordVerification } from './user-password-verification.schema';
import { userSession } from './user-session.schema';
import { wishlist } from './wishlist.schema';

export const userAuthoritiesEnum = pgEnum('user_authorities', tsEnumToPgEnum(Authorities));

export const user = pgTable(
  'user',
  {
    id: userId().primaryKey().notNull(),
    email: varchar({ length: 200 }).notNull(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    birthday: date(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    authorities: userAuthoritiesEnum().array().default([Authorities.ROLE_USER]).notNull(),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    ...timestamps,
  },
  _ => [uniqueIndex('user_email_unique_idx').using('btree', sql`lower((email)::text)`)],
);

export const userRelations = relations(user, ({ many }) => ({
  passwordVerifications: many(userPasswordVerification),
  emailChangeVerifications: many(userEmailChangeVerification),
  emailSettings: many(userEmailSetting),
  accounts: many(userAccount),
  sessions: many(userSession),
  wishlists: many(wishlist, { relationName: 'ownedWishlists' }),
  coOwnedWishlists: many(wishlist, { relationName: 'coOwnedWishlists' }),
  itemTakers: many(itemTaker),
}));
