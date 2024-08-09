import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/common-database'

import { UserEmailSettingEntity } from './email-settings.entity.js'

@Injectable()
export class EmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
