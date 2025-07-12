import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../../core/database'
import { PasswordVerificationEntity } from './legacy-password-verification.entity'

@Injectable()
export class LegacyPasswordVerificationRepository extends BaseRepository(PasswordVerificationEntity) {}
