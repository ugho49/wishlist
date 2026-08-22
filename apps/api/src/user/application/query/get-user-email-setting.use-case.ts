import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ICurrentUser, UserEmailSettingsDto } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { userEmailSettingMapper } from '../../infrastructure/email-settings.mapper';

export type GetUserEmailSettingInput = {
  currentUser: ICurrentUser;
};

@Injectable()
export class GetUserEmailSettingUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(query: GetUserEmailSettingInput): Promise<UserEmailSettingsDto> {
    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(query.currentUser.id);

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found');
    }

    return userEmailSettingMapper.toDto(userEmailSetting);
  }
}
