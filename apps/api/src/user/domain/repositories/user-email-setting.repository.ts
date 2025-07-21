import type { UserEmailSettingId, UserId } from '@wishlist/common'

import type { UserEmailSetting } from '../models/user-email-setting.model'

export interface UserEmailSettingRepository {
  newId(): UserEmailSettingId
  findByUserId(userId: UserId): Promise<UserEmailSetting | undefined>
  save(userEmailSetting: UserEmailSetting): Promise<void>
}
