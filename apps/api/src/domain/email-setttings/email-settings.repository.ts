import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/nestjs/modules/database'

import { UserEmailSettingEntity } from './email-settings.entity'

@Injectable()
export class EmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
