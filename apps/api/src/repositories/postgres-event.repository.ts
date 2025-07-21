import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { Event, EventRepository } from '@wishlist/api/event'
import { EventId, UserId, uuid } from '@wishlist/common'
import { and, count, desc, eq, gte, inArray, SelectedFields } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { EventAttendeeRepository } from '../attendee'
import { PostgresEventAttendeeRepository } from './postgres-event-attendee.repository'
import { EVENT_ATTENDEE_REPOSITORY } from './repositories.tokens'

@Injectable()
export class PostgresEventRepository implements EventRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(EVENT_ATTENDEE_REPOSITORY) private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  newId(): EventId {
    return uuid() as EventId
  }

  async findById(id: EventId): Promise<Event | undefined> {
    const result = await this.databaseService.db.query.event.findFirst({
      where: eq(schema.event.id, id),
      with: { attendees: { with: { user: true } }, eventWishlists: true },
    })

    if (!result) return undefined

    return PostgresEventRepository.toModel(result)
  }

  async findByIds(ids: EventId[]): Promise<Event[]> {
    const result = await this.databaseService.db.query.event.findMany({
      where: inArray(schema.event.id, ids),
      with: { attendees: { with: { user: true } }, eventWishlists: true },
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

  async findAllPaginated(params: {
    pagination: { take: number; skip: number }
  }): Promise<{ events: Event[]; totalCount: number }> {
    // Get total count
    const totalCountResult = await this.databaseService.db.select({ count: count() }).from(schema.event)

    const totalCount = totalCountResult[0]?.count ?? 0

    if (totalCount === 0) return { events: [], totalCount }

    // Get full event data with attendees
    const result = await this.databaseService.db.query.event.findMany({
      with: { attendees: { with: { user: true } }, eventWishlists: true },
      orderBy: desc(schema.event.createdAt),
      limit: params.pagination.take,
      offset: params.pagination.skip,
    })

    const events = result.map(PostgresEventRepository.toModel)

    return { events, totalCount }
  }

  async findByUserIdPaginated(params: {
    userId: UserId
    pagination: { take: number; skip: number }
    onlyFuture: boolean
  }): Promise<{ events: Event[]; totalCount: number }> {
    const baseQuery = (selectFields: SelectedFields<any, typeof schema.event>) =>
      this.databaseService.db
        .select(selectFields)
        .from(schema.event)
        .innerJoin(schema.eventAttendee, eq(schema.event.id, schema.eventAttendee.eventId))
        .where(
          and(
            eq(schema.eventAttendee.userId, params.userId),
            ...(params.onlyFuture ? [gte(schema.event.eventDate, DateTime.now().toISODate())] : []),
          ),
        )

    const totalCountResult = (await baseQuery({ count: count() })) as Array<{ count: number }>
    const totalCount = totalCountResult[0]?.count ?? 0

    if (totalCount === 0) return { events: [], totalCount }

    // Get ordered event IDs
    const orderedEventIds = (await baseQuery({ id: schema.event.id })
      .orderBy(desc(schema.event.eventDate), desc(schema.event.createdAt))
      .limit(params.pagination.take)
      .offset(params.pagination.skip)) as Array<{ id: EventId }>

    // Get full event data with attendees
    const validEvents = await this.databaseService.db.query.event.findMany({
      where: inArray(
        schema.event.id,
        orderedEventIds.map(row => row.id),
      ),
      with: { attendees: { with: { user: true } }, eventWishlists: true },
    })

    // Maintain order
    const eventsMap = new Map(validEvents.map(e => [e.id, e]))
    const events = orderedEventIds
      .map(row => eventsMap.get(row.id))
      .filter((event): event is NonNullable<typeof event> => event !== undefined)
      .map(PostgresEventRepository.toModel)

    return { events, totalCount }
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

      await subTx.delete(schema.eventAttendee).where(eq(schema.eventAttendee.eventId, event.id))

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
      eventWishlists: (typeof schema.eventWishlist.$inferSelect)[]
    },
  ): Event {
    return new Event({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      eventDate: new Date(row.eventDate),
      attendees: row.attendees.map(attendee => PostgresEventAttendeeRepository.toModel(attendee)),
      wishlistIds: row.eventWishlists.map(eventWishlist => eventWishlist.wishlistId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
