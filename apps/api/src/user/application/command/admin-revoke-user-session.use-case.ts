import type { ICurrentUser, UserId, UserRefreshTokenId } from '@wishlist/common';

import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRepository } from '../../domain/repository/user.repository';
import { type UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

export type AdminRevokeUserSessionInput = {
  currentUser: ICurrentUser;
  userId: UserId;
  sessionId: UserRefreshTokenId;
};

@Injectable()
export class AdminRevokeUserSessionUseCase {
  private readonly logger = new Logger(AdminRevokeUserSessionUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(input: AdminRevokeUserSessionInput): Promise<void> {
    this.logger.log('Admin revoke session request received', { userId: input.userId, sessionId: input.sessionId });

    const user = await this.userRepository.findByIdOrFail(input.userId);
    const canManageUser = (input.currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin();

    if (input.userId === input.currentUser.id || !canManageUser) {
      throw new UnauthorizedException('You cannot manage this user');
    }

    const session = await this.refreshTokenRepository.findById(input.sessionId);

    if (!session || session.userId !== input.userId) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      return;
    }

    await this.refreshTokenRepository.save(session.revoke());
  }
}
