import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, UserEmailSettingsDto } from '@wishlist/common'

import { UserEmailSettingRepository } from '../../domain'
import { userEmailSettingMapper } from '../../infrastructure'

export type UpdateUserEmailSettingInput = {
  currentUser: ICurrentUser
  dailyNewItemNotification: boolean
}

@Injectable()
export class UpdateUserEmailSettingUseCase {
  private readonly logger = new Logger(UpdateUserEmailSettingUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(input: UpdateUserEmailSettingInput): Promise<UserEmailSettingsDto> {
    this.logger.log('Update user email setting request received', { input })
    const { currentUser, dailyNewItemNotification } = input

    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(currentUser.id)

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found')
    }

    const updatedUserEmailSetting = userEmailSetting.updatePreferences({
      dailyNewItemNotification,
    })

    this.logger.log('Saving user email setting...', {
      userId: currentUser.id,
      updatedFields: ['dailyNewItemNotification'],
    })
    await this.userEmailSettingRepository.save(updatedUserEmailSetting)

    return userEmailSettingMapper.toDto(updatedUserEmailSetting)
  }
}
