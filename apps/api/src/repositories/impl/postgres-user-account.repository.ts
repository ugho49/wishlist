import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserAccountId, type UserId, uuid } from '@wishlist/common';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserAccount } from '../../user/domain/model/user-account.model';
import { type UserAccountRepository } from '../../user/domain/repository/user-account.repository';
import { type UserAccountProvider } from '../../user/domain/user-account-provider.enum';

@Injectable()
export class PostgresUserAccountRepository implements UserAccountRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserAccountId {
    return uuid() as UserAccountId;
  }

  async findByProviderAccountId(
    providerAccountId: string,
    provider: UserAccountProvider,
  ): Promise<UserAccount | undefined> {
    const userAccount = await this.databaseService.db.query.userAccount.findFirst({
      where: and(
        eq(schema.userAccount.providerAccountId, providerAccountId),
        eq(schema.userAccount.provider, provider),
      ),
    });

    return userAccount ? PostgresUserAccountRepository.toModel(userAccount) : undefined;
  }

  async findByUserIdAndProvider(userId: UserId, provider: UserAccountProvider): Promise<UserAccount | undefined> {
    const userAccount = await this.databaseService.db.query.userAccount.findFirst({
      where: and(eq(schema.userAccount.userId, userId), eq(schema.userAccount.provider, provider)),
    });

    return userAccount ? PostgresUserAccountRepository.toModel(userAccount) : undefined;
  }

  async findByUserId(userId: UserId): Promise<UserAccount[]> {
    const userAccounts = await this.databaseService.db.query.userAccount.findMany({
      where: eq(schema.userAccount.userId, userId),
    });

    return userAccounts.map(userAccount => PostgresUserAccountRepository.toModel(userAccount));
  }

  async findByUserIds(userIds: UserId[]): Promise<UserAccount[]> {
    const userAccounts = await this.databaseService.db.query.userAccount.findMany({
      where: inArray(schema.userAccount.userId, userIds),
    });

    return userAccounts.map(userAccount => PostgresUserAccountRepository.toModel(userAccount));
  }

  async findByIds(userAccountIds: UserAccountId[]): Promise<UserAccount[]> {
    const userAccounts = await this.databaseService.db.query.userAccount.findMany({
      where: inArray(schema.userAccount.id, userAccountIds),
    });

    return userAccounts.map(userAccount => PostgresUserAccountRepository.toModel(userAccount));
  }

  async save(userAccount: UserAccount, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db;

    const values = {
      id: userAccount.id,
      email: userAccount.email,
      userId: userAccount.userId,
      provider: userAccount.provider,
      providerAccountId: userAccount.providerAccountId,
      passwordHash: userAccount.passwordHash,
      pictureUrl: userAccount.pictureUrl,
      createdAt: userAccount.createdAt,
      updatedAt: userAccount.updatedAt,
    };

    const updateSet = {
      pictureUrl: userAccount.pictureUrl,
      email: userAccount.email,
      passwordHash: userAccount.passwordHash,
      updatedAt: userAccount.updatedAt,
    };

    if (userAccount.providerAccountId) {
      await client
        .insert(schema.userAccount)
        .values(values)
        .onConflictDoUpdate({
          target: [schema.userAccount.provider, schema.userAccount.providerAccountId],
          targetWhere: sql`${schema.userAccount.providerAccountId} IS NOT NULL`,
          set: updateSet,
        });
      return;
    }

    await client
      .insert(schema.userAccount)
      .values(values)
      .onConflictDoUpdate({
        target: [schema.userAccount.userId, schema.userAccount.provider],
        set: updateSet,
      });
  }

  async delete(id: UserAccountId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db;

    await client.delete(schema.userAccount).where(eq(schema.userAccount.id, id));
  }

  static toModel(row: typeof schema.userAccount.$inferSelect): UserAccount {
    return new UserAccount({
      id: row.id,
      userId: row.userId,
      email: row.email,
      provider: row.provider,
      providerAccountId: row.providerAccountId ?? undefined,
      passwordHash: row.passwordHash ?? undefined,
      pictureUrl: row.pictureUrl ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
