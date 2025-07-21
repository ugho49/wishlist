import { Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { EventAttendee, EventAttendeeRepository } from '@wishlist/api/attendee'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { AttendeeId, AttendeeRole, EventId, uuid } from '@wishlist/common'
import { and, eq, inArray, or } from 'drizzle-orm'

import { PostgresUserRepository } from './postgres-user.repository'

@Injectable()
export class PostgresEventAttendeeRepository implements EventAttendeeRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): AttendeeId {
    return uuid() as AttendeeId
  }

  async findById(id: AttendeeId): Promise<EventAttendee | undefined> {
    const attendee = await this.databaseService.db.query.eventAttendee.findFirst({
      where: eq(schema.eventAttendee.id, id),
      with: { user: true },
    })

    if (!attendee) return undefined

    return PostgresEventAttendeeRepository.toModel(attendee)
  }

  async findByIdOrFail(id: AttendeeId): Promise<EventAttendee> {
    const attendee = await this.findById(id)
    if (!attendee) throw new NotFoundException('Attendee not found')
    return attendee
  }

  async findByIds(ids: AttendeeId[]): Promise<EventAttendee[]> {
    if (ids.length === 0) return []

    const attendees = await this.databaseService.db.query.eventAttendee.findMany({
      where: inArray(schema.eventAttendee.id, ids),
      with: { user: true },
    })

    return attendees.map(attendee => PostgresEventAttendeeRepository.toModel(attendee))
  }

  async findByEventId(eventId: EventId): Promise<EventAttendee[]> {
    const attendees = await this.databaseService.db.query.eventAttendee.findMany({
      where: eq(schema.eventAttendee.eventId, eventId),
      with: { user: true },
    })

    return attendees.map(PostgresEventAttendeeRepository.toModel)
  }

  async existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean> {
    const attendee = await this.databaseService.db.query.eventAttendee.findFirst({
      columns: { id: true },
      where: and(
        eq(schema.eventAttendee.eventId, param.eventId),
        or(eq(schema.user.email, param.email), eq(schema.eventAttendee.tempUserEmail, param.email)),
      ),
    })

    return !!attendee
  }

  async save(attendee: EventAttendee, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client
      .insert(schema.eventAttendee)
      .values({
        id: attendee.id,
        eventId: attendee.eventId,
        userId: attendee.user?.id ?? null,
        tempUserEmail: attendee.pendingEmail ?? null,
        role: attendee.role,
      })
      .onConflictDoUpdate({
        target: schema.eventAttendee.id,
        set: {
          userId: attendee.user?.id ?? null,
          tempUserEmail: attendee.pendingEmail ?? null,
          role: attendee.role,
        },
      })
  }

  async delete(id: AttendeeId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client.delete(schema.eventAttendee).where(eq(schema.eventAttendee.id, id))
  }

  static toModel(
    attendee: typeof schema.eventAttendee.$inferSelect & { user: typeof schema.user.$inferSelect | null },
  ): EventAttendee {
    return new EventAttendee({
      id: attendee.id,
      eventId: attendee.eventId,
      user: attendee.user ? PostgresUserRepository.toModel(attendee.user) : undefined,
      pendingEmail: attendee.tempUserEmail ?? undefined,
      role: attendee.role as AttendeeRole,
    })
  }
}
