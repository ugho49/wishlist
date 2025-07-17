import { Injectable, NotFoundException } from '@nestjs/common'
import { EventId } from '@wishlist/common'
import { eq } from 'drizzle-orm'

import * as schema from '../../drizzle/schema'
import { DatabaseService } from '../core/database'
import { Event } from '../event/domain/event.model'
import { EventRepository } from '../event/domain/event.repository'

@Injectable()
export class PostgresEventRepository implements EventRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: EventId): Promise<Event | undefined> {
    const { schema, db } = this.databaseService

    const result = await db.select().from(schema.event).where(eq(schema.event.id, id)).limit(1)

    if (result.length === 0) return undefined

    return PostgresEventRepository.toModel(result[0]!)
  }

  async findByIdOrFail(id: EventId): Promise<Event> {
    const event = await this.findById(id)
    if (!event) {
      throw new NotFoundException('Event not found')
    }
    return event
  }

  async save(event: Event): Promise<void> {
    const { schema, db } = this.databaseService

    await db
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
    const { schema, db } = this.databaseService

    await db.delete(schema.event).where(eq(schema.event.id, id))
  }

  static toModel(row: typeof schema.event.$inferSelect): Event {
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
