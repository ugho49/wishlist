import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser } from '@wishlist/common'

import { UserEmailChangeVerificationRepository } from '../../domain'

export type GetPendingEmailChangeResult = { newEmail: string; expiredAt: string } | undefined

export type GetPendingEmailChangeInput = {
  currentUser: ICurrentUser
}

@Injectable()
export class GetPendingEmailChangeUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_CHANGE_VERIFICATION)
    private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository,
  ) {}

  async execute(query: GetPendingEmailChangeInput): Promise<GetPendingEmailChangeResult> {
    const verifications = await this.emailChangeVerificationRepository.findByUserId(query.currentUser.id)

    // Find the first non-expired verification
    const activeVerification = verifications.find(v => !v.isExpired())

    if (!activeVerification) {
      return undefined
    }

    return {
      newEmail: activeVerification.newEmail,
      expiredAt: activeVerification.expiredAt.toISOString(),
    }
  }
}
