import type { DrizzleDatabase } from '@wishlist/api/core'
import type { EventId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

import { createEventAttendeeFactory } from './event-attendee.factory'
import { insertRow, type LooseInsert } from './insert-row'

type EventInsert = InferInsertModel<typeof schema.event>

export type CreateEventOverrides = Omit<LooseInsert<EventInsert>, 'eventDate'> & {
  eventDate?: Date | string
}

function toIsoDate(value: Date | string): string {
  if (typeof value === 'string') {
    return value
  }

  return DateTime.fromJSDate(value).toISODate() ?? value.toISOString().split('T')[0]!
}

export function createEventFactory(db: DrizzleDatabase) {
  const attendees = createEventAttendeeFactory(db)

  return {
    create(overrides: CreateEventOverrides = {}) {
      const { eventDate, ...rest } = overrides

      return insertRow(db, schema.event, {
        id: uuid() as EventId,
        title: faker.lorem.words({ min: 2, max: 5 }),
        eventDate: toIsoDate(eventDate ?? DateTime.now().plus({ days: 30 }).toJSDate()),
        ...rest,
      } as EventInsert)
    },

    async createWithMaintainer(overrides: CreateEventOverrides & { maintainerId: string }): Promise<{
      event: typeof schema.event.$inferSelect
      attendee: typeof schema.eventAttendee.$inferSelect
      eventDate: DateTime
    }> {
      const { maintainerId, ...eventOverrides } = overrides
      const event = await this.create(eventOverrides)
      const attendee = await attendees.createMaintainer({ eventId: event.id, userId: maintainerId })

      return {
        event,
        attendee,
        eventDate: DateTime.fromISO(event.eventDate),
      }
    },
  }
}
