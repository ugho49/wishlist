import type { DrizzleDatabase } from '@wishlist/api/core'
import type { AttendeeId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { schema } from '@wishlist/api-drizzle'
import { AttendeeRole, uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type EventAttendeeInsert = InferInsertModel<typeof schema.eventAttendee>

export type CreateEventAttendeeOverrides = LooseInsert<EventAttendeeInsert> & {
  eventId: string
}

export function createEventAttendeeFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateEventAttendeeOverrides) {
      return insertRow(db, schema.eventAttendee, {
        id: uuid() as AttendeeId,
        role: AttendeeRole.USER,
        ...overrides,
      } as EventAttendeeInsert)
    },

    createPending(overrides: CreateEventAttendeeOverrides & { tempUserEmail: string }) {
      return this.create({
        role: AttendeeRole.USER,
        ...overrides,
        userId: undefined,
      })
    },

    createMaintainer(overrides: CreateEventAttendeeOverrides & { userId: string }) {
      return this.create({
        ...overrides,
        role: AttendeeRole.MAINTAINER,
        tempUserEmail: undefined,
      })
    },
  }
}
