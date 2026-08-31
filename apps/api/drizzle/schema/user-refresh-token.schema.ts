import { relations, sql } from 'drizzle-orm';
import { foreignKey, index, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { timestampWithTimezone } from '../helpers';
import { userId, userRefreshTokenId } from '../ids';
import { user } from './user.schema';

export const userRefreshToken = pgTable(
  'user_refresh_token',
  {
    id: userRefreshTokenId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    userAgent: varchar('user_agent', { length: 1000 }),
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
      name: 'user_refresh_token_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_refresh_token_token_hash_key').on(table.tokenHash),
    index('user_refresh_token_user_id_idx').on(table.userId),
    index('user_refresh_token_user_id_active_idx').on(table.userId).where(sql`${table.revokedAt} IS NULL`),
  ],
);

export const userRefreshTokenRelations = relations(userRefreshToken, ({ one }) => ({
  user: one(user, {
    fields: [userRefreshToken.userId],
    references: [user.id],
  }),
}));
