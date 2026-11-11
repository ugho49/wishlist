import type { UserEmailChangeVerificationRepository } from '../../domain/repository/user-email-change-verification.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';

export type GetPendingEmailChangeResult = { newEmail: string; expiredAt: string } | undefined;

export type GetPendingEmailChangeInput = {
  currentUser: ICurrentUser;
};

@Injectable()
export class GetPendingEmailChangeUseCase {
  constructor(private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository) {}

  async execute(query: GetPendingEmailChangeInput): Promise<GetPendingEmailChangeResult> {
    const verifications = await this.emailChangeVerificationRepository.findByUserId(query.currentUser.id);

    // Find the first non-expired verification
    const activeVerification = verifications.find(v => !v.isExpired());

    if (!activeVerification) {
      return undefined;
    }

    return {
      newEmail: activeVerification.newEmail,
      expiredAt: activeVerification.expiredAt.toISOString(),
    };
  }
}
