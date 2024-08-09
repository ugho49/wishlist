import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/common-database'

import { PasswordVerificationEntity } from './password-verification.entity.js'

@Injectable()
export class PasswordVerificationRepository extends BaseRepository(PasswordVerificationEntity) {}
