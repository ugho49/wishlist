import { Injectable, NotFoundException } from '@nestjs/common'
import { EventId, UserId } from '@wishlist/common'
import { and, eq } from 'drizzle-orm'

import * as schema from '../../drizzle/schema'
import { DatabaseService } from '../core/database'
import { Event } from '../event/domain/event.model'
import { EventRepository } from '../event/domain/event.repository'

@Injectable()
export class PostgresEventRepository implements EventRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: EventId): Promise<Event | undefined> {
    const { schema, client } = this.databaseService

    const result = await client.select().from(schema.event).where(eq(schema.event.id, id)).limit(1)

    if (result.length === 0) return undefined

    return this.toModel(result[0]!)
  }

  async findByIdForUser(id: EventId, userId: UserId): Promise<Event | undefined> {
    const { schema, client } = this.databaseService

    const result = await client
      .select({
        id: schema.event.id,
        title: schema.event.title,
        description: schema.event.description,
        eventDate: schema.event.eventDate,
        createdAt: schema.event.createdAt,
        updatedAt: schema.event.updatedAt,
      })
      .from(schema.event)
      .innerJoin(schema.eventAttendee, eq(schema.event.id, schema.eventAttendee.eventId))
      .where(and(eq(schema.event.id, id), eq(schema.eventAttendee.userId, userId)))
      .limit(1)

    if (result.length === 0) return undefined

    return this.toModel(result[0]!)
  }

  async findByIdOrFail(id: EventId): Promise<Event> {
    const event = await this.findById(id)
    if (!event) {
      throw new NotFoundException('Event not found')
    }
    return event
  }

  async save(event: Event): Promise<void> {
    const { schema, client } = this.databaseService

    await client
      .insert(schema.event)
      .values({
        id: event.id,
        title: event.title,
        description: event.description ?? null,
        eventDate: event.eventDate.toISOString().split('T')[0] as string, // Convert to YYYY-MM-DD format
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.event.id,
        set: {
          title: event.title,
          description: event.description ?? null,
          eventDate: event.eventDate.toISOString().split('T')[0] as string, // Convert to YYYY-MM-DD format
        },
      })
  }

  async delete(id: EventId): Promise<void> {
    const { schema, client } = this.databaseService

    await client.delete(schema.event).where(eq(schema.event.id, id))
  }

  private toModel(row: typeof schema.event.$inferSelect): Event {
    return new Event({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      eventDate: new Date(row.eventDate),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })
  }
}
