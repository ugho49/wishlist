import { Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { Attendee, AttendeeRepository } from '@wishlist/api/attendee'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { AttendeeId, AttendeeRole, EventId } from '@wishlist/common'
import { and, eq, inArray, or } from 'drizzle-orm'

import { PostgresUserRepository } from './user.repository'

@Injectable()
export class PostgresAttendeeRepository implements AttendeeRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: AttendeeId): Promise<Attendee | undefined> {
    const attendee = await this.databaseService.db.query.eventAttendee.findFirst({
      where: eq(schema.eventAttendee.id, id),
      with: { user: true },
    })

    if (!attendee) return undefined

    return PostgresAttendeeRepository.toModel(attendee)
  }

  async findByIdOrFail(id: AttendeeId): Promise<Attendee> {
    const attendee = await this.findById(id)
    if (!attendee) throw new NotFoundException('Attendee not found')
    return attendee
  }

  async findByIds(ids: AttendeeId[]): Promise<Attendee[]> {
    if (ids.length === 0) return []

    const attendees = await this.databaseService.db.query.eventAttendee.findMany({
      where: inArray(schema.eventAttendee.id, ids),
      with: { user: true },
    })

    return attendees.map(attendee => PostgresAttendeeRepository.toModel(attendee))
  }

  async findByEventId(eventId: EventId): Promise<Attendee[]> {
    const attendees = await this.databaseService.db.query.eventAttendee.findMany({
      where: eq(schema.eventAttendee.eventId, eventId),
      with: { user: true },
    })

    return attendees.map(PostgresAttendeeRepository.toModel)
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

  async save(attendee: Attendee, tx?: DrizzleTransaction): Promise<void> {
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
  ): Attendee {
    return new Attendee({
      id: attendee.id,
      eventId: attendee.eventId,
      user: attendee.user ? PostgresUserRepository.toModel(attendee.user) : undefined,
      pendingEmail: attendee.tempUserEmail ?? undefined,
      role: attendee.role as AttendeeRole,
    })
  }
}
