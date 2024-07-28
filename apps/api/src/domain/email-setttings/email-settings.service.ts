import { Injectable } from '@nestjs/common'
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common-types'

import { UserEmailSettingEntity } from './email-settings.entity'
import { toDto } from './email-settings.mapper'
import { EmailSettingsRepository } from './email-settings.repository'

@Injectable()
export class EmailSettingsService {
  constructor(private readonly emailSettingEntityRepository: EmailSettingsRepository) {}

  async findByUserId(userId: string): Promise<UserEmailSettingsDto> {
    return this.findByUserIdOrCreateDefault(userId).then(entity => toDto(entity))
  }

  async update(userId: string, dto: UpdateUserEmailSettingsInputDto): Promise<UserEmailSettingsDto> {
    const entity = await this.findByUserIdOrCreateDefault(userId)
    entity.dailyNewItemNotification = dto.daily_new_item_notification
    return this.emailSettingEntityRepository.save(entity).then(entity => toDto(entity))
  }

  private async findByUserIdOrCreateDefault(userId: string): Promise<UserEmailSettingEntity> {
    let entity = await this.emailSettingEntityRepository.findOneBy({ userId })

    if (!entity) {
      entity = await this.emailSettingEntityRepository.save(UserEmailSettingEntity.create({ userId }))
    }

    return entity
  }
}
