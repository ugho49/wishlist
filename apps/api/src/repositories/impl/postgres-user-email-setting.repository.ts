import { Injectable } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type UserEmailSettingId, type UserId, uuid } from '@wishlist/common';
import { eq } from 'drizzle-orm';

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

  async save(userEmailSetting: UserEmailSetting, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db;

    await client
      .insert(schema.userEmailSetting)
      .values({
        id: userEmailSetting.id,
        userId: userEmailSetting.user.id,
        dailyNewItemNotification: userEmailSetting.dailyNewItemNotification,
        createdAt: userEmailSetting.createdAt,
        updatedAt: userEmailSetting.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.userEmailSetting.id,
        set: {
          dailyNewItemNotification: userEmailSetting.dailyNewItemNotification,
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
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
