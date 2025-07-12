import { Inject, Injectable } from '@nestjs/common'
import { EventId, SecretSantaId, SecretSantaStatus, UserId } from '@wishlist/common'
import { and, eq } from 'drizzle-orm'

import { DatabaseService, DrizzleTransaction } from '../core/database'
import { SecretSantaModel } from '../secret-santa/domain/model/secret-santa.model'
import { SecretSantaUserRepository } from '../secret-santa/domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../secret-santa/domain/repository/secret-santa.repository'
import { SECRET_SANTA_USER_REPOSITORY } from './repositories.tokens'

@Injectable()
export class PostgresSecretSantaRepository implements SecretSantaRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async save(secretSanta: SecretSantaModel, tx?: DrizzleTransaction): Promise<void> {
    const { schema, client } = this.databaseService
    const db = tx || client

    await db
      .insert(schema.secretSanta)
      .values({
        id: secretSanta.id,
        eventId: secretSanta.eventId,
        description: secretSanta.description,
        budget: secretSanta.budget?.toString(),
        status: secretSanta.status,
        createdAt: secretSanta.createdAt.toISOString(),
        updatedAt: secretSanta.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.secretSanta.id,
        set: {
          description: secretSanta.description,
          budget: secretSanta.budget?.toString(),
          status: secretSanta.status,
          updatedAt: secretSanta.updatedAt.toISOString(),
        },
      })
  }

  async existsForEvent(eventId: EventId): Promise<boolean> {
    const { schema, client } = this.databaseService

    const result = await client
      .select({ id: schema.secretSanta.id })
      .from(schema.secretSanta)
      .where(eq(schema.secretSanta.eventId, eventId))
      .limit(1)

    return result.length > 0
  }

  async findById(id: SecretSantaId): Promise<SecretSantaModel | undefined> {
    const { schema, client } = this.databaseService

    const result = await client.select().from(schema.secretSanta).where(eq(schema.secretSanta.id, id)).limit(1)

    if (result.length === 0) return undefined

    const users = await this.secretSantaUserRepository.findBySecretSantaId(id)
    const row = result[0]!

    return new SecretSantaModel({
      id: row.id,
      eventId: row.eventId,
      description: row.description || undefined,
      budget: row.budget ? parseFloat(row.budget) : undefined,
      status: row.status as SecretSantaStatus,
      users,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })
  }

  async getSecretSantaForEventAndUser(param: {
    eventId: EventId
    userId: UserId
  }): Promise<SecretSantaModel | undefined> {
    const { schema, client } = this.databaseService

    const result = await client
      .select({
        secretSanta: schema.secretSanta,
      })
      .from(schema.secretSanta)
      .innerJoin(schema.event, eq(schema.secretSanta.eventId, schema.event.id))
      .innerJoin(schema.eventAttendee, eq(schema.event.id, schema.eventAttendee.eventId))
      .where(and(eq(schema.event.id, param.eventId), eq(schema.eventAttendee.userId, param.userId)))
      .limit(1)

    if (result.length === 0) return undefined

    const secretSanta = result[0]!.secretSanta
    const users = await this.secretSantaUserRepository.findBySecretSantaId(secretSanta.id)

    return new SecretSantaModel({
      id: secretSanta.id,
      eventId: secretSanta.eventId,
      description: secretSanta.description || undefined,
      budget: secretSanta.budget ? parseFloat(secretSanta.budget) : undefined,
      status: secretSanta.status as SecretSantaStatus,
      users,
      createdAt: new Date(secretSanta.createdAt),
      updatedAt: new Date(secretSanta.updatedAt),
    })
  }

  async getSecretSantaForUserOrFail(param: { id: SecretSantaId; userId: UserId }): Promise<SecretSantaModel> {
    const { schema, client } = this.databaseService

    const result = await client
      .select({
        secretSanta: schema.secretSanta,
      })
      .from(schema.secretSanta)
      .innerJoin(schema.event, eq(schema.secretSanta.eventId, schema.event.id))
      .innerJoin(schema.eventAttendee, eq(schema.event.id, schema.eventAttendee.eventId))
      .where(and(eq(schema.secretSanta.id, param.id), eq(schema.eventAttendee.userId, param.userId)))
      .limit(1)

    if (result.length === 0) {
      throw new Error(`Secret Santa with id ${param.id} not found for user ${param.userId}`)
    }

    const secretSanta = result[0]!.secretSanta
    const users = await this.secretSantaUserRepository.findBySecretSantaId(secretSanta.id)

    return new SecretSantaModel({
      id: secretSanta.id,
      eventId: secretSanta.eventId,
      description: secretSanta.description || undefined,
      budget: secretSanta.budget ? parseFloat(secretSanta.budget) : undefined,
      status: secretSanta.status as SecretSantaStatus,
      users,
      createdAt: new Date(secretSanta.createdAt),
      updatedAt: new Date(secretSanta.updatedAt),
    })
  }

  async delete(id: SecretSantaId, tx?: DrizzleTransaction): Promise<void> {
    const { schema, client } = this.databaseService
    const db = tx || client

    await db.delete(schema.secretSanta).where(eq(schema.secretSanta.id, id))
  }
}
