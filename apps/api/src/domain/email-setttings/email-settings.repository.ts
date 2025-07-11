import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../../common'
import { UserEmailSettingEntity } from './email-settings.entity'

@Injectable()
export class EmailSettingsRepository extends BaseRepository(UserEmailSettingEntity) {}
