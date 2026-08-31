import type { ICurrentUser } from '@wishlist/common';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

export type RevokeAllOtherUserSessionsInput = {
  currentUser: ICurrentUser;
};

@Injectable()
export class RevokeAllOtherUserSessionsUseCase {
  private readonly logger = new Logger(RevokeAllOtherUserSessionsUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(input: RevokeAllOtherUserSessionsInput): Promise<void> {
    this.logger.log('Revoke all other sessions request received', { userId: input.currentUser.id });

    await this.refreshTokenRepository.revokeAllByUserId(input.currentUser.id, {
      exceptId: input.currentUser.sessionId,
    });
  }
}
