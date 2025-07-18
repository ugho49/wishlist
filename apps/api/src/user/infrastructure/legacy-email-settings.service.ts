import { Injectable } from '@nestjs/common'
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto, UserId } from '@wishlist/common'

import { UserEmailSettingEntity } from './legacy-email-settings.entity'
import { toDto } from './legacy-email-settings.mapper'
import { LegacyEmailSettingsRepository } from './legacy-email-settings.repository'

@Injectable()
export class LegacyEmailSettingsService {
  constructor(private readonly emailSettingEntityRepository: LegacyEmailSettingsRepository) {}

  async findByUserId(userId: UserId): Promise<UserEmailSettingsDto> {
    return this.findByUserIdOrCreateDefault(userId).then(entity => toDto(entity))
  }

  async update(userId: UserId, dto: UpdateUserEmailSettingsInputDto): Promise<UserEmailSettingsDto> {
    const entity = await this.findByUserIdOrCreateDefault(userId)
    entity.dailyNewItemNotification = dto.daily_new_item_notification
    return this.emailSettingEntityRepository.save(entity).then(entity => toDto(entity))
  }

  private async findByUserIdOrCreateDefault(userId: UserId): Promise<UserEmailSettingEntity> {
    let entity = await this.emailSettingEntityRepository.findOneBy({ userId })

    if (!entity) {
      entity = await this.emailSettingEntityRepository.save(UserEmailSettingEntity.create({ userId }))
    }

    return entity
  }
}
