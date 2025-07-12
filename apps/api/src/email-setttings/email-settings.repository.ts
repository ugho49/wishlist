import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../core/database'
import { UserEmailSettingEntity } from './email-settings.entity'

@Injectable()
export class EmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
