import type { ICurrentUser, UserSessionId } from '@wishlist/common';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserSessionRepository } from '../../domain/repository/user-session.repository';

export type RevokeUserSessionInput = {
  currentUser: ICurrentUser;
  sessionId: UserSessionId;
};

@Injectable()
export class RevokeUserSessionUseCase {
  private readonly logger = new Logger(RevokeUserSessionUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(input: RevokeUserSessionInput): Promise<void> {
    this.logger.log('Revoke session request received', { sessionId: input.sessionId });

    const session = await this.sessionRepository.findById(input.sessionId);

    if (!session || session.userId !== input.currentUser.id) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      return;
    }

    await this.sessionRepository.save(session.revoke());
    this.logger.log('Session revoked', { sessionId: session.id });
  }
}
