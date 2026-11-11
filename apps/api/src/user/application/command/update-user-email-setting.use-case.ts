import type { UserEmailSetting } from '../../domain/model/user-email-setting.model';
import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';
import { getLogger } from '@znight/observability';

export type UpdateUserEmailSettingInput = {
  currentUser: ICurrentUser;
  dailyNewItemNotification: boolean;
  birthdayReminder: boolean;
};

export type UpdateUserEmailSettingOutput = {
  userEmailSetting: UserEmailSetting;
};

@Injectable()
export class UpdateUserEmailSettingUseCase {
  private readonly logger = getLogger(UpdateUserEmailSettingUseCase.name);

  constructor(private readonly userEmailSettingRepository: UserEmailSettingRepository) {}

  async execute(input: UpdateUserEmailSettingInput): Promise<UpdateUserEmailSettingOutput> {
    this.logger.info('Update user email setting request received', { input });
    const { currentUser, dailyNewItemNotification, birthdayReminder } = input;

    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(currentUser.id);

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found');
    }

    const updatedUserEmailSetting = userEmailSetting.updatePreferences({
      dailyNewItemNotification,
      birthdayReminder,
    });

    this.logger.info('Saving user email setting...', {
      userId: currentUser.id,
      updatedFields: ['dailyNewItemNotification', 'birthdayReminder'],
    });
    await this.userEmailSettingRepository.save(updatedUserEmailSetting);

    return { userEmailSetting: updatedUserEmailSetting };
  }
}
