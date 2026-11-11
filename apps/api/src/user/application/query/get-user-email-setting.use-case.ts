import type { UserEmailSetting } from '../../domain/model/user-email-setting.model';
import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';

export type GetUserEmailSettingInput = {
  currentUser: ICurrentUser;
};

export type GetUserEmailSettingOutput = {
  userEmailSetting: UserEmailSetting;
};

@Injectable()
export class GetUserEmailSettingUseCase {
  constructor(private readonly userEmailSettingRepository: UserEmailSettingRepository) {}

  async execute(query: GetUserEmailSettingInput): Promise<GetUserEmailSettingOutput> {
    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(query.currentUser.id);

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found');
    }

    return { userEmailSetting };
  }
}
