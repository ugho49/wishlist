import { Injectable } from '@nestjs/common'
import { BaseRepository } from 'apps/api/src/common/database'

import { UserEmailSettingEntity } from './email-settings.entity'

@Injectable()
export class EmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
