import { Injectable } from '@nestjs/common'
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common-types'
import { UserEmailSettings, UserId } from '@wishlist/domain'

import { UserEmailSettingsMapper } from './email-settings.mapper'
import { EmailSettingsRepository } from './email-settings.repository'

@Injectable()
export class EmailSettingsService {
  constructor(private readonly emailSettingEntityRepository: EmailSettingsRepository) {}

  async findByUserId(userId: UserId): Promise<UserEmailSettingsDto> {
    return this.findByUserIdOrCreateDefault(userId).then(UserEmailSettingsMapper.toDto)
  }

  async update(userId: UserId, dto: UpdateUserEmailSettingsInputDto): Promise<void> {
    const entity = await this.findByUserIdOrCreateDefault(userId)
    await this.emailSettingEntityRepository.update(entity.id, {
      daily_new_item_notification: dto.daily_new_item_notification,
    })
  }

  private async findByUserIdOrCreateDefault(userId: UserId): Promise<UserEmailSettings> {
    let entity = await this.emailSettingEntityRepository.findByUserId(userId)

    if (!entity) {
      entity = new UserEmailSettings({
        id: UserEmailSettings.getNewId(),
        userId,
        dailyNewItemNotification: true,
      })
      await this.emailSettingEntityRepository.insert(entity)
    }

    return entity
  }
}
