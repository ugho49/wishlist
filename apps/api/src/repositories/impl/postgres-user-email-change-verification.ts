import { Injectable } from '@nestjs/common'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { UserEmailChangeVerificationRepository } from '@wishlist/api/user'
import { schema } from '@wishlist/api-drizzle'
import { UserEmailChangeVerificationId, UserId, uuid } from '@wishlist/common'
import { and, eq } from 'drizzle-orm'

import { UserEmailChangeVerification } from '../../user'
import { PostgresUserRepository } from './postgres-user.repository'

@Injectable()
export class PostgresUserEmailChangeVerificationRepository implements UserEmailChangeVerificationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserEmailChangeVerificationId {
    return uuid() as UserEmailChangeVerificationId
  }

  async findByUserId(userId: UserId): Promise<UserEmailChangeVerification[]> {
    const verifications = await this.databaseService.db.query.userEmailChangeVerification.findMany({
      where: eq(schema.userEmailChangeVerification.userId, userId),
      with: { user: true },
    })

    return verifications.map(PostgresUserEmailChangeVerificationRepository.toModel)
  }

  async findByTokenAndEmail(token: string, email: string): Promise<UserEmailChangeVerification | undefined> {
    const verification = await this.databaseService.db.query.userEmailChangeVerification.findFirst({
      where: and(
        eq(schema.userEmailChangeVerification.token, token),
        eq(schema.userEmailChangeVerification.newEmail, email),
      ),
      with: { user: true },
    })

    return verification ? PostgresUserEmailChangeVerificationRepository.toModel(verification) : undefined
  }

  async save(verification: UserEmailChangeVerification, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client
      .insert(schema.userEmailChangeVerification)
      .values({
        id: verification.id,
        userId: verification.user.id,
        newEmail: verification.newEmail,
        token: verification.token,
        expiredAt: verification.expiredAt,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.userEmailChangeVerification.id,
        set: {
          newEmail: verification.newEmail,
          token: verification.token,
          expiredAt: verification.expiredAt,
          updatedAt: verification.updatedAt,
        },
      })
  }

  async delete(id: UserEmailChangeVerificationId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client.delete(schema.userEmailChangeVerification).where(eq(schema.userEmailChangeVerification.id, id))
  }

  static toModel(
    row: typeof schema.userEmailChangeVerification.$inferSelect & { user: typeof schema.user.$inferSelect },
  ): UserEmailChangeVerification {
    return new UserEmailChangeVerification({
      id: row.id,
      user: PostgresUserRepository.toModel(row.user),
      newEmail: row.newEmail,
      token: row.token,
      expiredAt: row.expiredAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
