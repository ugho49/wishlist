import type { UserEmailSettingId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { User } from '../../src/user/domain/model/user.model';
import { UserEmailSetting } from '../../src/user/domain/model/user-email-setting.model';
import { UserBuilder } from './user.builder';

type UserEmailSettingBuilderData = {
  user: User;
  dailyNewItemNotification: boolean;
};

export class UserEmailSettingBuilder {
  private readonly data: UserEmailSettingBuilderData = {
    user: new UserBuilder().build(),
    dailyNewItemNotification: true,
  };

  withUser(user: User): this {
    this.data.user = user;
    return this;
  }

  withDailyNewItemNotification(dailyNewItemNotification: boolean): this {
    this.data.dailyNewItemNotification = dailyNewItemNotification;
    return this;
  }

  build(): UserEmailSetting {
    return UserEmailSetting.create({
      id: uuid() as UserEmailSettingId,
      user: this.data.user,
      dailyNewItemNotification: this.data.dailyNewItemNotification,
    });
  }
}
