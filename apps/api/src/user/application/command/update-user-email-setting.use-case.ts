import type { UserEmailSetting } from '../../domain/model/user-email-setting.model';
import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type UpdateUserEmailSettingInput = {
  currentUser: ICurrentUser;
  dailyNewItemNotification: boolean;
};

export type UpdateUserEmailSettingOutput = {
  userEmailSetting: UserEmailSetting;
};

@Injectable()
export class UpdateUserEmailSettingUseCase {
  private readonly logger = new Logger(UpdateUserEmailSettingUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(input: UpdateUserEmailSettingInput): Promise<UpdateUserEmailSettingOutput> {
    this.logger.log('Update user email setting request received', { input });
    const { currentUser, dailyNewItemNotification } = input;

    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(currentUser.id);

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found');
    }

    const updatedUserEmailSetting = userEmailSetting.updatePreferences({
      dailyNewItemNotification,
    });

    this.logger.log('Saving user email setting...', {
      userId: currentUser.id,
      updatedFields: ['dailyNewItemNotification'],
    });
    await this.userEmailSettingRepository.save(updatedUserEmailSetting);

    return { userEmailSetting: updatedUserEmailSetting };
  }
}
