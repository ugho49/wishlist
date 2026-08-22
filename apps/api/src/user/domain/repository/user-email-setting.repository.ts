import type { UserEmailSettingId, UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserEmailSetting } from '../model/user-email-setting.model';

export interface UserEmailSettingRepository {
  newId(): UserEmailSettingId;
  findByUserId(userId: UserId): Promise<UserEmailSetting | undefined>;
  save(userEmailSetting: UserEmailSetting, tx?: DrizzleTransaction): Promise<void>;
}
