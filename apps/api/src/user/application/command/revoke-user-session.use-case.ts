import type { ICurrentUser, UserRefreshTokenId } from '@wishlist/common';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

export type RevokeUserSessionInput = {
  currentUser: ICurrentUser;
  sessionId: UserRefreshTokenId;
};

@Injectable()
export class RevokeUserSessionUseCase {
  private readonly logger = new Logger(RevokeUserSessionUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(input: RevokeUserSessionInput): Promise<void> {
    this.logger.log('Revoke session request received', { sessionId: input.sessionId });

    const session = await this.refreshTokenRepository.findById(input.sessionId);

    if (!session || session.userId !== input.currentUser.id) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      return;
    }

    await this.refreshTokenRepository.save(session.revoke());
    this.logger.log('Session revoked', { sessionId: session.id });
  }
}
