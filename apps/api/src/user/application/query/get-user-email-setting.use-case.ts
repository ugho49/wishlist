import type { UserEmailSetting } from '../../domain/model/user-email-setting.model';
import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetUserEmailSettingInput = {
  currentUser: ICurrentUser;
};

export type GetUserEmailSettingOutput = {
  userEmailSetting: UserEmailSetting;
};

@Injectable()
export class GetUserEmailSettingUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(query: GetUserEmailSettingInput): Promise<GetUserEmailSettingOutput> {
    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(query.currentUser.id);

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found');
    }

    return { userEmailSetting };
  }
}
