import type { ICurrentUser, UserId, UserSessionId } from '@wishlist/common';

import { Injectable } from '@znight/core';
import { NotFoundException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type UserRepository } from '../../domain/repository/user.repository';
import { type UserSessionRepository } from '../../domain/repository/user-session.repository';

export type AdminRevokeUserSessionInput = {
  currentUser: ICurrentUser;
  userId: UserId;
  sessionId: UserSessionId;
};

@Injectable()
export class AdminRevokeUserSessionUseCase {
  private readonly logger = getLogger(AdminRevokeUserSessionUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(input: AdminRevokeUserSessionInput): Promise<void> {
    this.logger.info('Admin revoke session request received', { userId: input.userId, sessionId: input.sessionId });

    const user = await this.userRepository.findByIdOrFail(input.userId);
    const canManageUser = (input.currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin();

    if (input.userId === input.currentUser.id || !canManageUser) {
      throw new UnauthorizedException('You cannot manage this user');
    }

    const session = await this.sessionRepository.findById(input.sessionId);

    if (!session || session.userId !== input.userId) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      return;
    }

    await this.sessionRepository.save(session.revoke());
  }
}
