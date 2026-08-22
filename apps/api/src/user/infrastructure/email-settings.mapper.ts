import type { UserEmailSettingsDto } from '@wishlist/common';
import type { UserEmailSetting } from '../domain/model/user-email-setting.model';

function toDto(model: UserEmailSetting): UserEmailSettingsDto {
  return {
    daily_new_item_notification: model.dailyNewItemNotification,
  };
}

export const userEmailSettingMapper = {
  toDto,
};
