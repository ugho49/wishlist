import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/nestjs/modules/database'

import { UserSocialEntity } from './user-social.entity'

@Injectable()
export class UserSocialRepository extends BaseRepository(UserSocialEntity) {}
