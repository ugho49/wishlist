import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { Event, EventRepository } from '@wishlist/api/event'
import { EventId } from '@wishlist/common'
import { eq, inArray } from 'drizzle-orm'

import { AttendeeRepository } from '../attendee'
import { PostgresAttendeeRepository } from './attendee.repository'
import { ATTENDEE_REPOSITORY } from './repositories.tokens'

@Injectable()
export class PostgresEventRepository implements EventRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async findById(id: EventId): Promise<Event | undefined> {
    const result = await this.databaseService.db.query.event.findFirst({
      where: eq(schema.event.id, id),
      with: { attendees: { with: { user: true } } },
    })

    if (!result) return undefined

    return PostgresEventRepository.toModel(result)
  }

  async findByIds(ids: EventId[]): Promise<Event[]> {
    const result = await this.databaseService.db.query.event.findMany({
      where: inArray(schema.event.id, ids),
      with: { attendees: { with: { user: true } } },
    })

    return result.map(PostgresEventRepository.toModel)
  }

  async findByIdOrFail(id: EventId): Promise<Event> {
    const event = await this.findById(id)
    if (!event) {
      throw new NotFoundException('Event not found')
    }
    return event
  }

  async save(event: Event, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client.transaction(async subTx => {
      await subTx
        .insert(schema.event)
        .values({
          id: event.id,
          title: event.title,
          description: event.description ?? null,
          eventDate: event.eventDate.toISOString().split('T')[0] as string, // Convert to YYYY-MM-DD format
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })
        .onConflictDoUpdate({
          target: schema.event.id,
          set: {
            title: event.title,
            description: event.description ?? null,
            eventDate: event.eventDate.toISOString().split('T')[0] as string, // Convert to YYYY-MM-DD format
            updatedAt: event.updatedAt,
          },
        })

      for (const attendee of event.attendees) {
        await this.attendeeRepository.save(attendee, subTx)
      }
    })
  }

  async delete(id: EventId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client.delete(schema.event).where(eq(schema.event.id, id))
  }

  static toModel(
    row: typeof schema.event.$inferSelect & {
      attendees: (typeof schema.eventAttendee.$inferSelect & { user: typeof schema.user.$inferSelect | null })[]
    },
  ): Event {
    return new Event({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      eventDate: new Date(row.eventDate),
      attendees: row.attendees.map(attendee => PostgresAttendeeRepository.toModel(attendee)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
