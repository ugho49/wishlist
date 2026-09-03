import { Inject, Injectable, Logger } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export type LogoutInput = {
  refreshToken: string;
};

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    this.logger.log('Logout request received');

    const session = await this.sessionRepository.findByTokenHash(RefreshTokenManager.hash(input.refreshToken));

    if (!session || session.revokedAt) {
      return;
    }

    await this.sessionRepository.save(session.revoke());
    this.logger.log('Session revoked', { sessionId: session.id });
  }
}
