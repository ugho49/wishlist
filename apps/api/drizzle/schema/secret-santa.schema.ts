import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, text, unique, varchar } from 'drizzle-orm/pg-core';

import { numericNullable, timestamps } from '../helpers';
import { eventId, secretSantaId } from '../ids';
import { event } from './event.schema';
import { secretSantaUser } from './secret-santa-user.schema';

export const secretSanta = pgTable(
  'secret_santa',
  {
    id: secretSantaId().primaryKey().notNull(),
    eventId: eventId('event_id').notNull(),
    description: text(),
    budget: numericNullable('budget'),
    status: varchar({ length: 20 }).notNull(),
    ...timestamps,
  },
  table => [
    foreignKey({ columns: [table.eventId], foreignColumns: [event.id] }).onDelete('cascade'),
    unique().on(table.eventId),
  ],
);

export const secretSantaRelations = relations(secretSanta, ({ one, many }) => ({
  event: one(event, {
    fields: [secretSanta.eventId],
    references: [event.id],
  }),
  secretSantaUsers: many(secretSantaUser),
}));
