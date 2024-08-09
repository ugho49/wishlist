import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/common-database'

import { UserSocialEntity } from './user-social.entity.js'

@Injectable()
export class UserSocialRepository extends BaseRepository(UserSocialEntity) {}
