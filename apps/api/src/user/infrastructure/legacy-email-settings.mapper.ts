import type { UserEmailSettingsDto } from '@wishlist/common'

import type { UserEmailSettingEntity } from './legacy-email-settings.entity'

export function toDto(entity: UserEmailSettingEntity): UserEmailSettingsDto {
  return {
    daily_new_item_notification: entity.dailyNewItemNotification,
  }
}
