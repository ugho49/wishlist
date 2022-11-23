import { Injectable } from '@nestjs/common';
import { UserEmailSettingEntity } from './email-settings.entity';
import { BaseRepository } from '@wishlist/common-database';

@Injectable()
export class EmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
