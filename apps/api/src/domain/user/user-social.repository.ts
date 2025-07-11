import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../../common'
import { UserSocialEntity } from './user-social.entity'

@Injectable()
export class UserSocialRepository extends BaseRepository(UserSocialEntity) {}
