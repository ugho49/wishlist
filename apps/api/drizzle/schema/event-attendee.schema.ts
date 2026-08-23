import { AttendeeRole } from '@wishlist/common/enums/attendee.enum';
import { relations, sql } from 'drizzle-orm';
import { check, foreignKey, pgEnum, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { tsEnumToPgEnum } from '../enum';
import { attendeeId, eventId, userId } from '../ids';
import { event } from './event.schema';
import { secretSantaUser } from './secret-santa-user.schema';
import { user } from './user.schema';

export const attendeeRoleEnum = pgEnum('attendee_role', tsEnumToPgEnum(AttendeeRole));

export const eventAttendee = pgTable(
  'event_attendee',
  {
    id: attendeeId().primaryKey().notNull(),
    eventId: eventId('event_id').notNull(),
    userId: userId('user_id'),
    tempUserEmail: varchar('temp_user_email', { length: 200 }),
    role: attendeeRoleEnum().default(AttendeeRole.PARTICIPANT).notNull(),
  },
  table => [
    foreignKey({ columns: [table.eventId], foreignColumns: [event.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.userId], foreignColumns: [user.id] }).onDelete('cascade'),
    unique('event_attendee_event_id_user_id_temp_user_email_key').on(table.eventId, table.userId, table.tempUserEmail),
    check(
      'chk_user',
      sql`((user_id IS NOT NULL) AND (temp_user_email IS NULL)) OR ((user_id IS NULL) AND (temp_user_email IS NOT NULL))`,
    ),
  ],
);

export const eventAttendeeRelations = relations(eventAttendee, ({ one, many }) => ({
  event: one(event, {
    fields: [eventAttendee.eventId],
    references: [event.id],
  }),
  user: one(user, {
    fields: [eventAttendee.userId],
    references: [user.id],
  }),
  secretSantaUsers: many(secretSantaUser),
}));
