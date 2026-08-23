import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from '../helpers';
import { attendeeId, secretSantaId, secretSantaUserId } from '../ids';
import { eventAttendee } from './event-attendee.schema';
import { secretSanta } from './secret-santa.schema';

export const secretSantaUser = pgTable(
  'secret_santa_user',
  {
    id: secretSantaUserId().primaryKey().notNull(),
    secretSantaId: secretSantaId('secret_santa_id').notNull(),
    attendeeId: attendeeId('attendee_id').notNull(),
    drawUserId: secretSantaUserId('draw_user_id'),
    exclusions: secretSantaUserId().array().default([]).notNull(),
    ...timestamps,
  },
  table => [
    foreignKey({ columns: [table.secretSantaId], foreignColumns: [secretSanta.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.attendeeId], foreignColumns: [eventAttendee.id] }),
    uniqueIndex('secret_santa_user_secret_santa_id_attendee_id_key').on(table.secretSantaId, table.attendeeId),
  ],
);

export const secretSantaUserRelations = relations(secretSantaUser, ({ one, many }) => ({
  secretSanta: one(secretSanta, {
    fields: [secretSantaUser.secretSantaId],
    references: [secretSanta.id],
  }),
  secretSantaUser: one(secretSantaUser, {
    fields: [secretSantaUser.drawUserId],
    references: [secretSantaUser.id],
    relationName: 'secretSantaUser_drawUserId_secretSantaUser_id',
  }),
  secretSantaUsers: many(secretSantaUser, {
    relationName: 'secretSantaUser_drawUserId_secretSantaUser_id',
  }),
  eventAttendee: one(eventAttendee, {
    fields: [secretSantaUser.attendeeId],
    references: [eventAttendee.id],
  }),
}));
