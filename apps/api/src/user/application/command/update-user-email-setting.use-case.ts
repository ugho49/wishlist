import { Inject, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserEmailSettingCommand, UpdateUserEmailSettingResult, UserEmailSettingRepository } from '../../domain'
import { userEmailSettingMapper } from '../../infrastructure'

@CommandHandler(UpdateUserEmailSettingCommand)
export class UpdateUserEmailSettingUseCase implements IInferredCommandHandler<UpdateUserEmailSettingCommand> {
  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(command: UpdateUserEmailSettingCommand): Promise<UpdateUserEmailSettingResult> {
    const { currentUser, dailyNewItemNotification } = command

    const userEmailSetting = await this.userEmailSettingRepository.findByUserId(currentUser.id)

    if (!userEmailSetting) {
      throw new NotFoundException('User email setting not found')
    }

    const updatedUserEmailSetting = userEmailSetting.updatePreferences({
      dailyNewItemNotification,
    })

    await this.userEmailSettingRepository.save(updatedUserEmailSetting)

    return userEmailSettingMapper.toDto(updatedUserEmailSetting)
  }
}
