import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserId, type UserRefreshTokenId, uuid } from '@wishlist/common';
import { and, desc, eq, gt, inArray, isNull, ne } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserRefreshToken } from '../../user/domain/model/user-refresh-token.model';
import { type UserRefreshTokenRepository } from '../../user/domain/repository/user-refresh-token.repository';

@Injectable()
export class PostgresUserRefreshTokenRepository implements UserRefreshTokenRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserRefreshTokenId {
    return uuid() as UserRefreshTokenId;
  }

  async findById(id: UserRefreshTokenId): Promise<UserRefreshToken | undefined> {
    const row = await this.databaseService.db.query.userRefreshToken.findFirst({
      where: eq(schema.userRefreshToken.id, id),
    });

    return row ? PostgresUserRefreshTokenRepository.toModel(row) : undefined;
  }

  async findByTokenHash(tokenHash: string): Promise<UserRefreshToken | undefined> {
    const row = await this.databaseService.db.query.userRefreshToken.findFirst({
      where: eq(schema.userRefreshToken.tokenHash, tokenHash),
    });

    return row ? PostgresUserRefreshTokenRepository.toModel(row) : undefined;
  }

  findActiveByUserId(userId: UserId): Promise<UserRefreshToken[]> {
    return this.findActiveByUserIds([userId]);
  }

  async findActiveByUserIds(userIds: UserId[]): Promise<UserRefreshToken[]> {
    if (userIds.length === 0) return [];

    const rows = await this.databaseService.db.query.userRefreshToken.findMany({
      where: and(
        inArray(schema.userRefreshToken.userId, userIds),
        isNull(schema.userRefreshToken.revokedAt),
        gt(schema.userRefreshToken.expiresAt, new Date()),
      ),
      orderBy: [desc(schema.userRefreshToken.lastUsedAt)],
    });

    return rows.map(row => PostgresUserRefreshTokenRepository.toModel(row));
  }

  async save(session: UserRefreshToken, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db;

    const values = {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      userAgent: session.userAgent,
      ip: session.ip,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };

    await client
      .insert(schema.userRefreshToken)
      .values(values)
      .onConflictDoUpdate({
        target: [schema.userRefreshToken.id],
        set: {
          userAgent: session.userAgent,
          ip: session.ip,
          lastUsedAt: session.lastUsedAt,
          expiresAt: session.expiresAt,
          revokedAt: session.revokedAt ?? null,
        },
      });
  }

  async revokeAllByUserId(
    userId: UserId,
    params?: { exceptId?: UserRefreshTokenId; tx?: DrizzleTransaction },
  ): Promise<void> {
    const client = params?.tx ?? this.databaseService.db;

    await client
      .update(schema.userRefreshToken)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(schema.userRefreshToken.userId, userId),
          isNull(schema.userRefreshToken.revokedAt),
          params?.exceptId ? ne(schema.userRefreshToken.id, params.exceptId) : undefined,
        ),
      );
  }

  static toModel(row: typeof schema.userRefreshToken.$inferSelect): UserRefreshToken {
    return new UserRefreshToken({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      userAgent: row.userAgent ?? undefined,
      ip: row.ip ?? undefined,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt ?? undefined,
    });
  }
}
