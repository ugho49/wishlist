import { sql } from 'drizzle-orm';
import { check, foreignKey, index, pgEnum, pgTable, unique } from 'drizzle-orm/pg-core';

import { UserContactStatus } from '../../src/user/domain/user-contact-status.enum';
import { tsEnumToPgEnum } from '../enum';
import { timestamps } from '../helpers';
import { userContactId, userId } from '../ids';
import { user } from './user.schema';

export const userContactStatusEnum = pgEnum('user_contact_status', tsEnumToPgEnum(UserContactStatus));

/** A one-sided decision of `owner` about `contact` (friend added by email, or hidden). */
export const userContact = pgTable(
  'user_contact',
  {
    id: userContactId().primaryKey().notNull(),
    ownerUserId: userId('owner_user_id').notNull(),
    contactUserId: userId('contact_user_id').notNull(),
    status: userContactStatusEnum().notNull(),
    ...timestamps,
  },
  table => [
    foreignKey({
      columns: [table.ownerUserId],
      foreignColumns: [user.id],
      name: 'user_contact_owner_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.contactUserId],
      foreignColumns: [user.id],
      name: 'user_contact_contact_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_contact_owner_user_id_contact_user_id_key').on(table.ownerUserId, table.contactUserId),
    index('user_contact_contact_user_id_idx').on(table.contactUserId),
    check('chk_user_contact_not_self', sql`owner_user_id <> contact_user_id`),
  ],
);
