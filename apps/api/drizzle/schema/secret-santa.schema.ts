import { relations } from 'drizzle-orm';
import { foreignKey, pgEnum, pgTable, text, unique } from 'drizzle-orm/pg-core';

import { SecretSantaStatus } from '../../src/secret-santa/domain/secret-santa-status.enum';
import { tsEnumToPgEnum } from '../enum';
import { numericNullable, timestamps } from '../helpers';
import { eventId, secretSantaId } from '../ids';
import { event } from './event.schema';
import { secretSantaUser } from './secret-santa-user.schema';

export const secretSantaStatusEnum = pgEnum('secret_santa_status', tsEnumToPgEnum(SecretSantaStatus));

export const secretSanta = pgTable(
  'secret_santa',
  {
    id: secretSantaId().primaryKey().notNull(),
    eventId: eventId('event_id').notNull(),
    description: text(),
    budget: numericNullable('budget'),
    status: secretSantaStatusEnum().notNull(),
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
