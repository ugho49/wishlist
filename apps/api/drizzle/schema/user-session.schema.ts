import { relations, sql } from 'drizzle-orm';
import { foreignKey, index, pgEnum, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { UNKNOWN_SESSION_DEVICE, UserSessionDeviceType } from '../../src/user/domain/user-session-device-type.enum';
import { tsEnumToPgEnum } from '../enum';
import { timestampWithTimezone } from '../helpers';
import { userId, userSessionId } from '../ids';
import { user } from './user.schema';

export const userSessionDeviceTypeEnum = pgEnum('user_session_device_type', tsEnumToPgEnum(UserSessionDeviceType));

export const userSession = pgTable(
  'user_session',
  {
    id: userSessionId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    userAgent: varchar('user_agent', { length: 1000 }),
    browser: varchar({ length: 100 }).default(UNKNOWN_SESSION_DEVICE.browser).notNull(),
    browserVersion: varchar('browser_version', { length: 50 }),
    os: varchar({ length: 100 }).default(UNKNOWN_SESSION_DEVICE.os).notNull(),
    osVersion: varchar('os_version', { length: 50 }),
    deviceType: userSessionDeviceTypeEnum('device_type').default(UNKNOWN_SESSION_DEVICE.type).notNull(),
    vendor: varchar({ length: 100 }),
    model: varchar({ length: 100 }),
    label: varchar({ length: 200 }).default(UNKNOWN_SESSION_DEVICE.label).notNull(),
    ip: varchar({ length: 50 }),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    lastUsedAt: timestampWithTimezone('last_used_at').defaultNow().notNull(),
    expiresAt: timestampWithTimezone('expires_at').notNull(),
    revokedAt: timestampWithTimezone('revoked_at'),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_session_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_session_token_hash_key').on(table.tokenHash),
    index('user_session_user_id_idx').on(table.userId),
    index('user_session_user_id_active_idx').on(table.userId).where(sql`${table.revokedAt} IS NULL`),
    index('user_session_revoked_at_idx').on(table.revokedAt).where(sql`${table.revokedAt} IS NOT NULL`),
  ],
);

export const userSessionRelations = relations(userSession, ({ one }) => ({
  user: one(user, {
    fields: [userSession.userId],
    references: [user.id],
  }),
}));
