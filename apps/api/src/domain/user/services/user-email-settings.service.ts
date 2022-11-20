import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common-types';
import { UserEmailSettingEntity } from '../entities/user-email-settings.entity';
import { toDto } from '../mappers/user-email-settings.mapper';

@Injectable()
export class UserEmailSettingsService {
  constructor(
    @InjectRepository(UserEmailSettingEntity)
    private readonly emailSettingEntityRepository: Repository<UserEmailSettingEntity>
  ) {}

  async findByUserId(userId: string): Promise<UserEmailSettingsDto> {
    return this.findByUserIdOrCreateDefault(userId).then((entity) => toDto(entity));
  }

  async update(userId: string, dto: UpdateUserEmailSettingsInputDto): Promise<UserEmailSettingsDto> {
    const entity = await this.findByUserIdOrCreateDefault(userId);
    entity.dailyNewItemNotification = dto.daily_new_item_notification;
    return this.emailSettingEntityRepository.save(entity).then((entity) => toDto(entity));
  }

  private async findByUserIdOrCreateDefault(userId: string): Promise<UserEmailSettingEntity> {
    let entity = await this.emailSettingEntityRepository.findOneBy({ userId });

    if (!entity) {
      entity = await this.emailSettingEntityRepository.save(UserEmailSettingEntity.create({ userId }));
    }

    return entity;
  }
}
