import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserId, type UserSessionId, uuid } from '@wishlist/common';
import { and, desc, eq, gt, inArray, isNotNull, isNull, lt, ne } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserSession } from '../../user/domain/model/user-session.model';
import { type UserSessionRepository } from '../../user/domain/repository/user-session.repository';

@Injectable()
export class PostgresUserSessionRepository implements UserSessionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserSessionId {
    return uuid() as UserSessionId;
  }

  async findById(id: UserSessionId): Promise<UserSession | undefined> {
    const row = await this.databaseService.db.query.userSession.findFirst({
      where: eq(schema.userSession.id, id),
    });

    return row ? PostgresUserSessionRepository.toModel(row) : undefined;
  }

  async findByTokenHash(tokenHash: string): Promise<UserSession | undefined> {
    const row = await this.databaseService.db.query.userSession.findFirst({
      where: eq(schema.userSession.tokenHash, tokenHash),
    });

    return row ? PostgresUserSessionRepository.toModel(row) : undefined;
  }

  findActiveByUserId(userId: UserId): Promise<UserSession[]> {
    return this.findActiveByUserIds([userId]);
  }

  async findActiveByUserIds(userIds: UserId[]): Promise<UserSession[]> {
    if (userIds.length === 0) return [];

    const rows = await this.databaseService.db.query.userSession.findMany({
      where: and(
        inArray(schema.userSession.userId, userIds),
        isNull(schema.userSession.revokedAt),
        gt(schema.userSession.expiresAt, new Date()),
      ),
      orderBy: [desc(schema.userSession.lastUsedAt)],
    });

    return rows.map(row => PostgresUserSessionRepository.toModel(row));
  }

  async save(session: UserSession, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db;

    const values = {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      userAgent: session.userAgent,
      browser: session.browser,
      browserVersion: session.browserVersion,
      os: session.os,
      osVersion: session.osVersion,
      deviceType: session.deviceType,
      vendor: session.vendor,
      model: session.model,
      label: session.label,
      ip: session.ip,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };

    await client
      .insert(schema.userSession)
      .values(values)
      .onConflictDoUpdate({
        target: [schema.userSession.id],
        set: {
          tokenHash: session.tokenHash,
          lastUsedAt: session.lastUsedAt,
          expiresAt: session.expiresAt,
          revokedAt: session.revokedAt ?? null,
          ip: session.ip,
          browser: session.browser,
          browserVersion: session.browserVersion,
          os: session.os,
          osVersion: session.osVersion,
          deviceType: session.deviceType,
          vendor: session.vendor,
          model: session.model,
          label: session.label,
        },
      });
  }

  async revokeAllByUserId(
    userId: UserId,
    params?: { exceptId?: UserSessionId; tx?: DrizzleTransaction },
  ): Promise<void> {
    const client = params?.tx ?? this.databaseService.db;

    await client
      .update(schema.userSession)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(schema.userSession.userId, userId),
          isNull(schema.userSession.revokedAt),
          params?.exceptId ? ne(schema.userSession.id, params.exceptId) : undefined,
        ),
      );
  }

  async deleteRevokedOlderThan(date: Date): Promise<number> {
    const deleted = await this.databaseService.db
      .delete(schema.userSession)
      .where(and(isNotNull(schema.userSession.revokedAt), lt(schema.userSession.revokedAt, date)))
      .returning({ id: schema.userSession.id });

    return deleted.length;
  }

  static toModel(row: typeof schema.userSession.$inferSelect): UserSession {
    return new UserSession({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      userAgent: row.userAgent ?? undefined,
      browser: row.browser,
      browserVersion: row.browserVersion ?? undefined,
      os: row.os,
      osVersion: row.osVersion ?? undefined,
      deviceType: row.deviceType,
      vendor: row.vendor ?? undefined,
      model: row.model ?? undefined,
      label: row.label,
      ip: row.ip ?? undefined,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt ?? undefined,
    });
  }
}
