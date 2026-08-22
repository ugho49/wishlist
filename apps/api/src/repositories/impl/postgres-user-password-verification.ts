import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserId, type UserPasswordVerificationId, uuid } from '@wishlist/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserPasswordVerification } from '../../user/domain/model/user-password-verification.model';
import { type UserPasswordVerificationRepository } from '../../user/domain/repository/user-password-verification.repository';
import { PostgresUserRepository } from './postgres-user.repository';

@Injectable()
export class PostgresUserPasswordVerificationRepository implements UserPasswordVerificationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserPasswordVerificationId {
    return uuid() as UserPasswordVerificationId;
  }

  async findByUserId(userId: UserId): Promise<UserPasswordVerification[]> {
    const userPasswordVerifications = await this.databaseService.db.query.userPasswordVerification.findMany({
      where: eq(schema.userPasswordVerification.userId, userId),
      with: { user: true },
    });

    return userPasswordVerifications.map(PostgresUserPasswordVerificationRepository.toModel);
  }

  async save(userPasswordVerification: UserPasswordVerification, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db;

    await client
      .insert(schema.userPasswordVerification)
      .values({
        id: userPasswordVerification.id,
        userId: userPasswordVerification.user.id,
        token: userPasswordVerification.token,
        expiredAt: userPasswordVerification.expiredAt,
        createdAt: userPasswordVerification.createdAt,
        updatedAt: userPasswordVerification.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.userPasswordVerification.id,
        set: {
          token: userPasswordVerification.token,
          expiredAt: userPasswordVerification.expiredAt,
          updatedAt: userPasswordVerification.updatedAt,
        },
      });
  }

  async delete(id: UserPasswordVerificationId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db;

    await client.delete(schema.userPasswordVerification).where(eq(schema.userPasswordVerification.id, id));
  }

  static toModel(
    row: typeof schema.userPasswordVerification.$inferSelect & { user: typeof schema.user.$inferSelect },
  ): UserPasswordVerification {
    return new UserPasswordVerification({
      id: row.id,
      user: PostgresUserRepository.toModel(row.user),
      token: row.token,
      expiredAt: row.expiredAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
