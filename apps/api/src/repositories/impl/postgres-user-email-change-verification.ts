import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserEmailChangeVerificationId, type UserId, uuid } from '@wishlist/common';
import { and, eq } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserEmailChangeVerification } from '../../user/domain/model/user-email-change-verification.model';
import { type UserEmailChangeVerificationRepository } from '../../user/domain/repository/user-email-change-verification.repository';
import { PostgresUserRepository } from './postgres-user.repository';

@Injectable()
export class PostgresUserEmailChangeVerificationRepository implements UserEmailChangeVerificationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserEmailChangeVerificationId {
    return uuid() as UserEmailChangeVerificationId;
  }

  async findByUserId(userId: UserId): Promise<UserEmailChangeVerification[]> {
    const verifications = await this.databaseService.db.query.userEmailChangeVerification.findMany({
      where: eq(schema.userEmailChangeVerification.userId, userId),
      with: { user: true },
    });

    return verifications.map(PostgresUserEmailChangeVerificationRepository.toModel);
  }

  async findByTokenAndEmail(token: string, email: string): Promise<UserEmailChangeVerification | undefined> {
    const verification = await this.databaseService.db.query.userEmailChangeVerification.findFirst({
      where: and(
        eq(schema.userEmailChangeVerification.token, token),
        eq(schema.userEmailChangeVerification.newEmail, email),
      ),
      with: { user: true },
    });

    return verification ? PostgresUserEmailChangeVerificationRepository.toModel(verification) : undefined;
  }

  async save(verification: UserEmailChangeVerification, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db;

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
      });
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
    });
  }
}
