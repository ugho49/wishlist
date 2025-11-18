import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import {
  GetPendingEmailChangeQuery,
  GetPendingEmailChangeResult,
  UserEmailChangeVerificationRepository,
} from '../../domain'

@QueryHandler(GetPendingEmailChangeQuery)
export class GetPendingEmailChangeUseCase implements IInferredQueryHandler<GetPendingEmailChangeQuery> {
  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_CHANGE_VERIFICATION)
    private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository,
  ) {}

  async execute(query: GetPendingEmailChangeQuery): Promise<GetPendingEmailChangeResult> {
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
