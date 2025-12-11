import { Inject, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserEmailSettingCommand, UpdateUserEmailSettingResult, UserEmailSettingRepository } from '../../domain'
import { userEmailSettingMapper } from '../../infrastructure'

@CommandHandler(UpdateUserEmailSettingCommand)
export class UpdateUserEmailSettingUseCase implements IInferredCommandHandler<UpdateUserEmailSettingCommand> {
  private readonly logger = new Logger(UpdateUserEmailSettingUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
  ) {}

  async execute(command: UpdateUserEmailSettingCommand): Promise<UpdateUserEmailSettingResult> {
    this.logger.log('Update user email setting request received', { command })
    const { currentUser, dailyNewItemNotification } = command

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
