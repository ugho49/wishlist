import type { ICurrentUser, UserSessionId } from '@wishlist/common';

import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type UserSessionRepository } from '../../domain/repository/user-session.repository';

export type RevokeUserSessionInput = {
  currentUser: ICurrentUser;
  sessionId: UserSessionId;
};

@Injectable()
export class RevokeUserSessionUseCase {
  private readonly logger = getLogger(RevokeUserSessionUseCase.name);

  constructor(private readonly sessionRepository: UserSessionRepository) {}

  async execute(input: RevokeUserSessionInput): Promise<void> {
    this.logger.info('Revoke session request received', { sessionId: input.sessionId });

    const session = await this.sessionRepository.findById(input.sessionId);

    if (!session || session.userId !== input.currentUser.id) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      return;
    }

    await this.sessionRepository.save(session.revoke());
    this.logger.info('Session revoked', { sessionId: session.id });
  }
}
