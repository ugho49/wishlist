import { Inject, Injectable, Logger } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRefreshTokenRepository } from '../../../user/domain/repository/user-refresh-token.repository';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export type LogoutInput = {
  refreshToken: string;
};

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    this.logger.log('Logout request received');

    const session = await this.refreshTokenRepository.findByTokenHash(RefreshTokenManager.hash(input.refreshToken));

    if (!session || session.revokedAt) {
      return;
    }

    await this.refreshTokenRepository.save(session.revoke());
    this.logger.log('Session revoked', { sessionId: session.id });
  }
}
