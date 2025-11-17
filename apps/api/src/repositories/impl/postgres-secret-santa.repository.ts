import { Injectable, NotFoundException } from '@nestjs/common'
import { EventId, SecretSantaId, SecretSantaStatus, uuid } from '@wishlist/common'
import { eq } from 'drizzle-orm'

import * as schema from '../../../drizzle/schema'
import { DatabaseService, DrizzleTransaction } from '../../core/database'
import { SecretSanta } from '../../secret-santa/domain/model/secret-santa.model'
import { SecretSantaRepository } from '../../secret-santa/domain/repository/secret-santa.repository'
import { PostgresSecretSantaUserRepository } from './postgres-secret-santa-user.repository'

@Injectable()
export class PostgresSecretSantaRepository implements SecretSantaRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): SecretSantaId {
    return uuid() as SecretSantaId
  }

  async save(secretSanta: SecretSanta, tx?: DrizzleTransaction): Promise<void> {
    const { schema, db } = this.databaseService
    const client = tx || db

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
      })
  }

  async existsForEvent(eventId: EventId): Promise<boolean> {
    const { schema, db } = this.databaseService

    const result = await db.query.secretSanta.findFirst({
      columns: { id: true },
      where: eq(schema.secretSanta.eventId, eventId),
    })

    return !!result
  }

  async findById(id: SecretSantaId): Promise<SecretSanta | undefined> {
    const { schema, db } = this.databaseService

    const secretSanta = await db.query.secretSanta.findFirst({
      where: eq(schema.secretSanta.id, id),
      with: { secretSantaUsers: true },
    })

    if (!secretSanta) return undefined

    return PostgresSecretSantaRepository.toModel(secretSanta)
  }

  async findByIdOrFail(id: SecretSantaId): Promise<SecretSanta> {
    const secretSanta = await this.findById(id)

    if (!secretSanta) {
      throw new NotFoundException(`Secret Santa with id ${id} not found`)
    }

    return secretSanta
  }

  async findForEvent(param: { eventId: EventId }): Promise<SecretSanta | undefined> {
    const { schema, db } = this.databaseService

    const secretSanta = await db.query.secretSanta.findFirst({
      where: eq(schema.secretSanta.eventId, param.eventId),
      with: { secretSantaUsers: true },
    })

    if (!secretSanta) return undefined

    return PostgresSecretSantaRepository.toModel(secretSanta)
  }

  async delete(id: SecretSantaId, tx?: DrizzleTransaction): Promise<void> {
    const { schema, db } = this.databaseService
    const client = tx || db

    await client.delete(schema.secretSanta).where(eq(schema.secretSanta.id, id))
  }

  static toModel(
    secretSanta: typeof schema.secretSanta.$inferSelect & {
      secretSantaUsers: (typeof schema.secretSantaUser.$inferSelect)[]
    },
  ): SecretSanta {
    return new SecretSanta({
      id: secretSanta.id,
      eventId: secretSanta.eventId,
      description: secretSanta.description || undefined,
      budget: secretSanta.budget || undefined,
      status: secretSanta.status as SecretSantaStatus,
      users: secretSanta.secretSantaUsers.map(user => PostgresSecretSantaUserRepository.toModel(user)),
      createdAt: secretSanta.createdAt,
      updatedAt: secretSanta.updatedAt,
    })
  }
}
