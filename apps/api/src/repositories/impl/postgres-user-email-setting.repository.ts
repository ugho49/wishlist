import type { User } from '../../user/domain/model/user.model';

import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserEmailSettingId, type UserId, uuid } from '@wishlist/common';
import { and, eq, isNull, or, sql } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { UserEmailSetting } from '../../user/domain/model/user-email-setting.model';
import { type UserEmailSettingRepository } from '../../user/domain/repository/user-email-setting.repository';
import { PostgresUserRepository } from './postgres-user.repository';

@Injectable()
export class PostgresUserEmailSettingRepository implements UserEmailSettingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserEmailSettingId {
    return uuid() as UserEmailSettingId;
  }

  async findByUserId(userId: UserId): Promise<UserEmailSetting | undefined> {
    const userEmailSetting = await this.databaseService.db.query.userEmailSetting.findFirst({
      where: eq(schema.userEmailSetting.userId, userId),
      with: { user: true },
    });

    return userEmailSetting ? PostgresUserEmailSettingRepository.toModel(userEmailSetting) : undefined;
  }

  async findUsersForBirthdayReminder(params: { month: number; day: number }): Promise<User[]> {
    const rows = await this.databaseService.db
      .select({ user: schema.user })
      .from(schema.user)
      .leftJoin(schema.userEmailSetting, eq(schema.userEmailSetting.userId, schema.user.id))
      .where(
        and(
          eq(schema.user.isEnabled, true),
          sql`EXTRACT(MONTH FROM ${schema.user.birthday}) = ${params.month}`,
          sql`EXTRACT(DAY FROM ${schema.user.birthday}) = ${params.day}`,
          or(isNull(schema.userEmailSetting.id), eq(schema.userEmailSetting.birthdayReminder, true)),
        ),
      );

    return rows.map(row => PostgresUserRepository.toModel(row.user));
  }

  async findUsersForChristmasReminder(): Promise<User[]> {
    const rows = await this.databaseService.db
      .select({ user: schema.user })
      .from(schema.user)
      .leftJoin(schema.userEmailSetting, eq(schema.userEmailSetting.userId, schema.user.id))
      .where(
        and(
          eq(schema.user.isEnabled, true),
          or(isNull(schema.userEmailSetting.id), eq(schema.userEmailSetting.christmasReminder, true)),
        ),
      );

    return rows.map(row => PostgresUserRepository.toModel(row.user));
  }

  async save(userEmailSetting: UserEmailSetting, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db;

    await client
      .insert(schema.userEmailSetting)
      .values({
        id: userEmailSetting.id,
        userId: userEmailSetting.user.id,
        dailyNewItemNotification: userEmailSetting.dailyNewItemNotification,
        birthdayReminder: userEmailSetting.birthdayReminder,
        christmasReminder: userEmailSetting.christmasReminder,
        createdAt: userEmailSetting.createdAt,
        updatedAt: userEmailSetting.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.userEmailSetting.id,
        set: {
          dailyNewItemNotification: userEmailSetting.dailyNewItemNotification,
          birthdayReminder: userEmailSetting.birthdayReminder,
          christmasReminder: userEmailSetting.christmasReminder,
          updatedAt: userEmailSetting.updatedAt,
        },
      });
  }

  static toModel(
    row: typeof schema.userEmailSetting.$inferSelect & { user: typeof schema.user.$inferSelect },
  ): UserEmailSetting {
    return new UserEmailSetting({
      id: row.id,
      user: PostgresUserRepository.toModel(row.user),
      dailyNewItemNotification: row.dailyNewItemNotification,
      birthdayReminder: row.birthdayReminder,
      christmasReminder: row.christmasReminder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
