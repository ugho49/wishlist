import type { UserEmailSettingId, UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { User } from '../model/user.model';
import type { UserEmailSetting } from '../model/user-email-setting.model';

export interface UserEmailSettingRepository {
  newId(): UserEmailSettingId;
  findByUserId(userId: UserId): Promise<UserEmailSetting | undefined>;
  findUsersForBirthdayReminder(params: { month: number; day: number }): Promise<User[]>;
  findUsersForChristmasReminder(): Promise<User[]>;
  save(userEmailSetting: UserEmailSetting, tx?: DrizzleTransaction): Promise<void>;
}
