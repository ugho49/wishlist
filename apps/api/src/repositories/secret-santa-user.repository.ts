import { Injectable } from '@nestjs/common'
import { EventId, SecretSantaId, SecretSantaUserId, UserId } from '@wishlist/common'
import { and, eq, sql } from 'drizzle-orm'

import * as schema from '../../drizzle/schema'
import { DatabaseService, DrizzleTransaction } from '../core/database'
import { SecretSantaUserModel } from '../secret-santa/domain/model/secret-santa-user.model'
import { SecretSantaUserRepository } from '../secret-santa/domain/repository/secret-santa-user.repository'

@Injectable()
export class PostgresSecretSantaUserRepository implements SecretSantaUserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findBySecretSantaId(secretSantaId: SecretSantaId): Promise<SecretSantaUserModel[]> {
    const { schema, client } = this.databaseService

    const users = await client
      .select()
      .from(schema.secretSantaUser)
      .where(eq(schema.secretSantaUser.secretSantaId, secretSantaId))

    return users.map(this.toModel)
  }

  async save(users: SecretSantaUserModel[], tx?: DrizzleTransaction): Promise<void> {
    const { schema, client } = this.databaseService
    const db = tx || client

    if (users.length === 0) return

    await db
      .insert(schema.secretSantaUser)
      .values(
        users.map(user => ({
          id: user.id,
          secretSantaId: user.secretSantaId,
          attendeeId: user.attendeeId,
          drawUserId: user.drawUserId,
          exclusions: user.exclusions,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        })),
      )
      .onConflictDoUpdate({
        target: schema.secretSantaUser.id,
        set: {
          drawUserId: sql`excluded.draw_user_id`,
          exclusions: sql`excluded.exclusions`,
          updatedAt: sql`excluded.updated_at`,
        },
      })
  }

  async getDrawSecretSantaUserForEvent(param: {
    eventId: EventId
    userId: UserId
  }): Promise<SecretSantaUserModel | null> {
    const { schema, client } = this.databaseService

    const currentUser = await client
      .select({
        user: schema.secretSantaUser,
      })
      .from(schema.secretSantaUser)
      .innerJoin(schema.eventAttendee, eq(schema.secretSantaUser.attendeeId, schema.eventAttendee.id))
      .innerJoin(schema.secretSanta, eq(schema.secretSantaUser.secretSantaId, schema.secretSanta.id))
      .where(and(eq(schema.secretSanta.eventId, param.eventId), eq(schema.eventAttendee.userId, param.userId)))
      .limit(1)

    if (currentUser.length === 0 || !currentUser[0]!.user.drawUserId) {
      return null
    }

    const drawUser = await client
      .select()
      .from(schema.secretSantaUser)
      .where(eq(schema.secretSantaUser.id, currentUser[0]!.user.drawUserId))
      .limit(1)

    if (drawUser.length === 0) return null

    return this.toModel(drawUser[0]!)
  }

  async delete(id: SecretSantaUserId, tx?: DrizzleTransaction): Promise<void> {
    const { schema, client } = this.databaseService
    const db = tx || client

    await db.transaction(async subTx => {
      // Remove the user from all exclusion lists first
      await subTx
        .update(schema.secretSantaUser)
        .set({
          exclusions: sql`array_remove(exclusions, ${id})`,
        })
        .where(sql`${id} = ANY(exclusions)`)

      // Then delete the user
      await subTx.delete(schema.secretSantaUser).where(eq(schema.secretSantaUser.id, id))
    })
  }

  private toModel(row: typeof schema.secretSantaUser.$inferSelect): SecretSantaUserModel {
    return new SecretSantaUserModel({
      id: row.id,
      attendeeId: row.attendeeId,
      secretSantaId: row.secretSantaId,
      drawUserId: row.drawUserId || undefined,
      exclusions: row.exclusions,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })
  }
}
