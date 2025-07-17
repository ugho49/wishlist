import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../../core'
import { UserSocialEntity } from './legacy-user-social.entity'

@Injectable()
export class LegacyUserSocialRepository extends BaseRepository(UserSocialEntity) {}
