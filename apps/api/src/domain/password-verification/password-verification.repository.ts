import { Injectable } from '@nestjs/common'
import { BaseRepository } from 'apps/api/src/common/database'

import { PasswordVerificationEntity } from './password-verification.entity'

@Injectable()
export class PasswordVerificationRepository extends BaseRepository(PasswordVerificationEntity) {}
