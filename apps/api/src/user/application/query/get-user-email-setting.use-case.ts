import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, UserEmailSettingsDto } from '@wishlist/common'

import { UserEmailSettingRepository } from '../../domain'
import { userEmailSettingMapper } from '../../infrastructure'

export type GetUserEmailSettingInput = {
  currentUser: ICurrentUser
}

@Injectable()
export class GetUserEmailSettingUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(query: GetUserEmailSettingInput): Promise<UserEmailSettingsDto> {
    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(query.currentUser.id)

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found')
    }

    return userEmailSettingMapper.toDto(userEmailSetting)
  }
}
