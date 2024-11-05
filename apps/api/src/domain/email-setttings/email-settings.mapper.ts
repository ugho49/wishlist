import type { UserEmailSettingsDto } from '@wishlist/common-types'

import type { UserEmailSettingEntity } from './email-settings.entity'

export function toDto(entity: UserEmailSettingEntity): UserEmailSettingsDto {
  return {
    daily_new_item_notification: entity.dailyNewItemNotification,
  }
}
