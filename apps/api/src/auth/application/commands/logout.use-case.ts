import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { type UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export type LogoutInput = {
  refreshToken: string;
};

@Injectable()
export class LogoutUseCase {
  private readonly logger = getLogger(LogoutUseCase.name);

  constructor(private readonly sessionRepository: UserSessionRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    this.logger.info('Logout request received');

    const session = await this.sessionRepository.findByTokenHash(RefreshTokenManager.hash(input.refreshToken));

    if (!session || session.revokedAt) {
      return;
    }

    await this.sessionRepository.save(session.revoke());
    this.logger.info('Session revoked', { sessionId: session.id });
  }
}
