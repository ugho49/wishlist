import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../../core'
import { UserEmailSettingEntity } from './legacy-email-settings.entity'

@Injectable()
export class LegacyEmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
