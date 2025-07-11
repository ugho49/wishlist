import { Injectable } from '@nestjs/common'

import { BaseRepository } from '../../common'
import { PasswordVerificationEntity } from './password-verification.entity'

@Injectable()
export class PasswordVerificationRepository extends BaseRepository(PasswordVerificationEntity) {}
