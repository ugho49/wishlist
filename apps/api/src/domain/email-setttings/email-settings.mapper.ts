import { UserEmailSettingTable } from '@wishlist/common-database'
import { UserEmailSettingsDto } from '@wishlist/common-types'
import { UserEmailSettings } from '@wishlist/domain'
import { Insertable, Selectable } from 'kysely'

export const UserEmailSettingsMapper = {
  toDto: (settings: UserEmailSettings): UserEmailSettingsDto => ({
    daily_new_item_notification: settings.dailyNewItemNotification,
  }),
  toDomain: (params: Selectable<UserEmailSettingTable>): UserEmailSettings =>
    new UserEmailSettings({
      id: params.id,
      userId: params.user_id,
      dailyNewItemNotification: params.daily_new_item_notification,
      createdAt: new Date(params.created_at),
      updatedAt: new Date(params.updated_at),
    }),
  toInsertable(settings: UserEmailSettings): Insertable<UserEmailSettingTable> {
    return {
      id: settings.id,
      user_id: settings.userId,
      daily_new_item_notification: settings.dailyNewItemNotification,
      created_at: settings.createdAt,
      updated_at: settings.updatedAt,
    }
  },
}
