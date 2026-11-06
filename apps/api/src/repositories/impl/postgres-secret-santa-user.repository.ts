import type * as drizzleSchema from '../../../drizzle/schema';
import type { DrizzleTransaction } from '../../core/database/transaction-manager';

import { Injectable } from '@nestjs/common';
import { type EventId, type SecretSantaId, type SecretSantaUserId, type UserId, uuid } from '@wishlist/common';
import { and, eq, sql } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { SecretSantaUser } from '../../secret-santa/domain/model/secret-santa-user.model';
import { type SecretSantaUserRepository } from '../../secret-santa/domain/repository/secret-santa-user.repository';

@Injectable()
export class PostgresSecretSantaUserRepository implements SecretSantaUserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): SecretSantaUserId {
    return uuid() as SecretSantaUserId;
  }

  async findById(id: SecretSantaUserId): Promise<SecretSantaUser | undefined> {
    const { schema, db } = this.databaseService;

    const user = await db.query.secretSantaUser.findFirst({
      where: eq(schema.secretSantaUser.id, id),
    });

    return user ? PostgresSecretSantaUserRepository.toModel(user) : undefined;
  }

  async findBySecretSantaId(secretSantaId: SecretSantaId): Promise<SecretSantaUser[]> {
    const { schema, db } = this.databaseService;

    const users = await db.query.secretSantaUser.findMany({
      where: eq(schema.secretSantaUser.secretSantaId, secretSantaId),
    });

    return users.map(PostgresSecretSantaUserRepository.toModel);
  }

  async saveAll(users: SecretSantaUser[], tx?: DrizzleTransaction): Promise<void> {
    const { schema, db } = this.databaseService;
    const client = tx || db;

    if (users.length === 0) return;

    await client
      .insert(schema.secretSantaUser)
      .values(
        users.map(user => ({
          id: user.id,
          secretSantaId: user.secretSantaId,
          attendeeId: user.attendeeId,
          drawUserId: user.drawUserId,
          drawRevealedAt: user.drawRevealedAt ?? null,
          exclusions: user.exclusions,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      )
      .onConflictDoUpdate({
        target: schema.secretSantaUser.id,
        set: {
          drawUserId: sql`excluded.draw_user_id`,
          drawRevealedAt: sql`excluded.draw_revealed_at`,
          exclusions: sql`excluded.exclusions`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }

  async findParticipantForEvent(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaUser | undefined> {
    const { schema, db } = this.databaseService;

    const rows = await db
      .select({
        user: schema.secretSantaUser,
      })
      .from(schema.secretSantaUser)
      .innerJoin(schema.eventAttendee, eq(schema.secretSantaUser.attendeeId, schema.eventAttendee.id))
      .innerJoin(schema.secretSanta, eq(schema.secretSantaUser.secretSantaId, schema.secretSanta.id))
      .where(and(eq(schema.secretSanta.eventId, param.eventId), eq(schema.eventAttendee.userId, param.userId)))
      .limit(1);

    const user = rows[0]?.user;
    return user ? PostgresSecretSantaUserRepository.toModel(user) : undefined;
  }

  async delete(id: SecretSantaUserId, tx?: DrizzleTransaction): Promise<void> {
    const { schema, db } = this.databaseService;
    const client = tx || db;

    await client.transaction(async (subTx: DrizzleTransaction) => {
      // Remove the user from all exclusion lists first
      await subTx
        .update(schema.secretSantaUser)
        .set({
          exclusions: sql`array_remove(exclusions, ${id})`,
        })
        .where(sql`${id} = ANY(exclusions)`);

      // Then delete the user
      await subTx.delete(schema.secretSantaUser).where(eq(schema.secretSantaUser.id, id));
    });
  }

  static toModel(row: typeof drizzleSchema.secretSantaUser.$inferSelect): SecretSantaUser {
    return new SecretSantaUser({
      id: row.id,
      attendeeId: row.attendeeId,
      secretSantaId: row.secretSantaId,
      drawUserId: row.drawUserId || undefined,
      drawRevealedAt: row.drawRevealedAt ?? undefined,
      exclusions: row.exclusions,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
