import { Injectable } from '@nestjs/common'
import { AttendeeId, AttendeeRole, EventId } from '@wishlist/common'
import { and, eq, inArray, or } from 'drizzle-orm'

import * as schema from '../../drizzle/schema'
import { Attendee } from '../attendee/domain/attendee.model'
import { AttendeeRepository } from '../attendee/domain/attendee.repository'
import { DatabaseService } from '../core/database'

@Injectable()
export class PostgresAttendeeRepository implements AttendeeRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: AttendeeId): Promise<Attendee | undefined> {
    const { schema, client } = this.databaseService

    const result = await client.select().from(schema.eventAttendee).where(eq(schema.eventAttendee.id, id)).limit(1)

    if (result.length === 0) return undefined

    return this.toModel(result[0]!)
  }

  async findByIds(ids: AttendeeId[]): Promise<Attendee[]> {
    const { schema, client } = this.databaseService

    if (ids.length === 0) return []

    const result = await client.select().from(schema.eventAttendee).where(inArray(schema.eventAttendee.id, ids))

    return result.map(this.toModel)
  }

  async findByEventId(eventId: EventId): Promise<Attendee[]> {
    const { schema, client } = this.databaseService

    const result = await client.select().from(schema.eventAttendee).where(eq(schema.eventAttendee.eventId, eventId))

    return result.map(this.toModel)
  }

  async existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean> {
    const { schema, client } = this.databaseService

    const result = await client
      .select({ id: schema.eventAttendee.id })
      .from(schema.eventAttendee)
      .leftJoin(schema.user, eq(schema.eventAttendee.userId, schema.user.id))
      .where(
        and(
          eq(schema.eventAttendee.eventId, param.eventId),
          or(eq(schema.user.email, param.email), eq(schema.eventAttendee.tempUserEmail, param.email)),
        ),
      )
      .limit(1)

    return result.length > 0
  }

  async save(attendee: Attendee): Promise<void> {
    const { schema, client } = this.databaseService

    await client
      .insert(schema.eventAttendee)
      .values({
        id: attendee.id,
        eventId: attendee.eventId,
        userId: attendee.userId ?? null,
        tempUserEmail: attendee.email ?? null,
        role: attendee.role,
      })
      .onConflictDoUpdate({
        target: schema.eventAttendee.id,
        set: {
          userId: attendee.userId ?? null,
          tempUserEmail: attendee.email ?? null,
          role: attendee.role,
        },
      })
  }

  async delete(id: AttendeeId): Promise<void> {
    const { schema, client } = this.databaseService

    await client.delete(schema.eventAttendee).where(eq(schema.eventAttendee.id, id))
  }

  private toModel(row: typeof schema.eventAttendee.$inferSelect): Attendee {
    return new Attendee({
      id: row.id,
      eventId: row.eventId,
      userId: row.userId ?? undefined,
      email: row.tempUserEmail ?? undefined,
      role: row.role as AttendeeRole,
    })
  }
}
