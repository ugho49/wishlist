import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserId, type UserNotificationId, uuid } from '@wishlist/common';
import { and, count, desc, eq, isNull, sql } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserNotification } from '../../notification/domain/model/user-notification.model';
import { type UserNotificationRepository } from '../../notification/domain/repository/user-notification.repository';

@Injectable()
export class PostgresUserNotificationRepository implements UserNotificationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserNotificationId {
    return uuid() as UserNotificationId;
  }

  async findByIdForUser(params: { id: UserNotificationId; userId: UserId }): Promise<UserNotification | undefined> {
    const row = await this.databaseService.db.query.userNotification.findFirst({
      where: and(eq(schema.userNotification.id, params.id), eq(schema.userNotification.userId, params.userId)),
    });

    return row ? PostgresUserNotificationRepository.toModel(row) : undefined;
  }

  async findByUserIdPaginated(params: {
    userId: UserId;
    pagination: { take: number; skip: number };
  }): Promise<{ notifications: UserNotification[]; totalCount: number }> {
    const { userId, pagination } = params;
    const where = eq(schema.userNotification.userId, userId);

    const [totalCountResult, rows] = await Promise.all([
      this.databaseService.db.select({ count: count() }).from(schema.userNotification).where(where),
      this.databaseService.db.query.userNotification.findMany({
        where,
        orderBy: [desc(schema.userNotification.createdAt)],
        limit: pagination.take,
        offset: pagination.skip,
      }),
    ]);

    return {
      notifications: rows.map(row => PostgresUserNotificationRepository.toModel(row)),
      totalCount: totalCountResult[0]?.count ?? 0,
    };
  }

  async countUnread(userId: UserId): Promise<number> {
    const result = await this.databaseService.db
      .select({ count: count() })
      .from(schema.userNotification)
      .where(and(eq(schema.userNotification.userId, userId), isNull(schema.userNotification.readAt)));

    return result[0]?.count ?? 0;
  }

  async save(notification: UserNotification, tx?: DrizzleTransaction): Promise<void> {
    await this.saveAll([notification], tx);
  }

  async saveAll(notifications: UserNotification[], tx?: DrizzleTransaction): Promise<void> {
    if (notifications.length === 0) {
      return;
    }

    const client = tx || this.databaseService.db;

    await client
      .insert(schema.userNotification)
      .values(
        notifications.map(notification => ({
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          eventId: notification.eventId,
          wishlistId: notification.wishlistId,
          itemId: notification.itemId,
          readAt: notification.readAt,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        })),
      )
      .onConflictDoUpdate({
        target: schema.userNotification.id,
        set: {
          readAt: sql`excluded.read_at`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }

  async markAllRead(userId: UserId): Promise<void> {
    const now = new Date();
    await this.databaseService.db
      .update(schema.userNotification)
      .set({ readAt: now, updatedAt: now })
      .where(and(eq(schema.userNotification.userId, userId), isNull(schema.userNotification.readAt)));
  }

  static toModel(row: typeof schema.userNotification.$inferSelect): UserNotification {
    return new UserNotification({
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      body: row.body,
      eventId: row.eventId ?? undefined,
      wishlistId: row.wishlistId ?? undefined,
      itemId: row.itemId ?? undefined,
      readAt: row.readAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
