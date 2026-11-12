import type * as drizzleSchema from '../../../drizzle/schema';
import type { DrizzleDatabase } from '../../core/database/database.factory';
import type { DrizzleTransaction } from '../../core/database/transaction-manager';

import { schema } from '@wishlist/api-drizzle';
import { type EventId, type SecretSantaId, type UserId, uuid } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';
import { and, count, desc, eq, exists, inArray, or, type SQL } from 'drizzle-orm';

import { AttendeeRole } from '../../event/domain/attendee-role.enum';
import { SecretSanta } from '../../secret-santa/domain/model/secret-santa.model';
import { type SecretSantaRepository } from '../../secret-santa/domain/repository/secret-santa.repository';
import { SecretSantaStatus } from '../../secret-santa/domain/secret-santa-status.enum';
import { PostgresSecretSantaUserRepository } from './postgres-secret-santa-user.repository';

@Injectable()
export class PostgresSecretSantaRepository implements SecretSantaRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  newId(): SecretSantaId {
    return uuid() as SecretSantaId;
  }

  async save(secretSanta: SecretSanta, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.db;

    await client
      .insert(schema.secretSanta)
      .values({
        id: secretSanta.id,
        eventId: secretSanta.eventId,
        description: secretSanta.description,
        budget: secretSanta.budget,
        status: secretSanta.status,
        createdAt: secretSanta.createdAt,
        updatedAt: secretSanta.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.secretSanta.id,
        set: {
          description: secretSanta.description,
          budget: secretSanta.budget,
          status: secretSanta.status,
          updatedAt: secretSanta.updatedAt,
        },
      });
  }

  async existsForEvent(eventId: EventId): Promise<boolean> {
    const result = await this.db.query.secretSanta.findFirst({
      columns: { id: true },
      where: eq(schema.secretSanta.eventId, eventId),
    });

    return !!result;
  }

  async findById(id: SecretSantaId): Promise<SecretSanta | undefined> {
    const secretSanta = await this.db.query.secretSanta.findFirst({
      where: eq(schema.secretSanta.id, id),
      with: { secretSantaUsers: true },
    });

    if (!secretSanta) return undefined;

    return PostgresSecretSantaRepository.toModel(secretSanta);
  }

  async findByIdOrFail(id: SecretSantaId): Promise<SecretSanta> {
    const secretSanta = await this.findById(id);

    if (!secretSanta) {
      throw new NotFoundException(`Secret Santa with id ${id} not found`);
    }

    return secretSanta;
  }

  async findForEvent(param: { eventId: EventId }): Promise<SecretSanta | undefined> {
    const secretSanta = await this.db.query.secretSanta.findFirst({
      where: eq(schema.secretSanta.eventId, param.eventId),
      with: { secretSantaUsers: true },
    });

    if (!secretSanta) return undefined;

    return PostgresSecretSantaRepository.toModel(secretSanta);
  }

  async findByEventIds(eventIds: EventId[]): Promise<SecretSanta[]> {
    if (eventIds.length === 0) return [];

    const secretSantas = await this.db.query.secretSanta.findMany({
      where: inArray(schema.secretSanta.eventId, eventIds),
      with: { secretSantaUsers: true },
    });

    return secretSantas.map(secretSanta => PostgresSecretSantaRepository.toModel(secretSanta));
  }

  async findVisibleForUserPaginated(params: {
    userId: UserId;
    pagination: { take: number; skip: number };
  }): Promise<{ secretSantas: SecretSanta[]; totalCount: number }> {
    const visibleToUser = this.visibleToUserCondition(params.userId);

    const totalCountResult = await this.db.select({ count: count() }).from(schema.secretSanta).where(visibleToUser);

    const totalCount = totalCountResult[0]?.count ?? 0;

    if (totalCount === 0) return { secretSantas: [], totalCount };

    const orderedIds = await this.db
      .select({ id: schema.secretSanta.id })
      .from(schema.secretSanta)
      .innerJoin(schema.event, eq(schema.event.id, schema.secretSanta.eventId))
      .where(visibleToUser)
      .orderBy(desc(schema.event.eventDate), desc(schema.secretSanta.createdAt))
      .limit(params.pagination.take)
      .offset(params.pagination.skip);

    const rows = await this.db.query.secretSanta.findMany({
      where: inArray(
        schema.secretSanta.id,
        orderedIds.map(row => row.id),
      ),
      with: { secretSantaUsers: true },
    });

    const rowsById = new Map(rows.map(row => [row.id, row]));
    const secretSantas = orderedIds
      .map(row => rowsById.get(row.id))
      .filter((row): row is NonNullable<typeof row> => row !== undefined)
      .map(row => PostgresSecretSantaRepository.toModel(row));

    return { secretSantas, totalCount };
  }

  private visibleToUserCondition(userId: UserId): SQL | undefined {
    const isStartedParticipant = and(
      eq(schema.secretSanta.status, SecretSantaStatus.STARTED),
      exists(
        this.db
          .select({ id: schema.secretSantaUser.id })
          .from(schema.secretSantaUser)
          .innerJoin(schema.eventAttendee, eq(schema.eventAttendee.id, schema.secretSantaUser.attendeeId))
          .where(
            and(
              eq(schema.secretSantaUser.secretSantaId, schema.secretSanta.id),
              eq(schema.eventAttendee.userId, userId),
            ),
          ),
      ),
    );

    const isDraftOrganizer = and(
      eq(schema.secretSanta.status, SecretSantaStatus.CREATED),
      exists(
        this.db
          .select({ id: schema.eventAttendee.id })
          .from(schema.eventAttendee)
          .where(
            and(
              eq(schema.eventAttendee.eventId, schema.secretSanta.eventId),
              eq(schema.eventAttendee.userId, userId),
              inArray(schema.eventAttendee.role, [AttendeeRole.CREATOR, AttendeeRole.ADMIN]),
            ),
          ),
      ),
    );

    return or(isStartedParticipant, isDraftOrganizer);
  }

  async delete(id: SecretSantaId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.db;

    await client.delete(schema.secretSanta).where(eq(schema.secretSanta.id, id));
  }

  static toModel(
    secretSanta: typeof drizzleSchema.secretSanta.$inferSelect & {
      secretSantaUsers: (typeof drizzleSchema.secretSantaUser.$inferSelect)[];
    },
  ): SecretSanta {
    return new SecretSanta({
      id: secretSanta.id,
      eventId: secretSanta.eventId,
      description: secretSanta.description || undefined,
      budget: secretSanta.budget || undefined,
      status: secretSanta.status,
      users: secretSanta.secretSantaUsers.map(user => PostgresSecretSantaUserRepository.toModel(user)),
      createdAt: secretSanta.createdAt,
      updatedAt: secretSanta.updatedAt,
    });
  }
}
