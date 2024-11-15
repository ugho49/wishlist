import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/nestjs/modules/database'

import { PasswordVerificationEntity } from './password-verification.entity'

@Injectable()
export class PasswordVerificationRepository extends BaseRepository(PasswordVerificationEntity) {}
