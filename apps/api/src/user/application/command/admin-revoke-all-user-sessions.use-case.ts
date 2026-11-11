import type { ICurrentUser, UserId } from '@wishlist/common';

import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type UserRepository } from '../../domain/repository/user.repository';
import { type UserSessionRepository } from '../../domain/repository/user-session.repository';

export type AdminRevokeAllUserSessionsInput = {
  currentUser: ICurrentUser;
  userId: UserId;
};

@Injectable()
export class AdminRevokeAllUserSessionsUseCase {
  private readonly logger = getLogger(AdminRevokeAllUserSessionsUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(input: AdminRevokeAllUserSessionsInput): Promise<void> {
    this.logger.info('Admin revoke all sessions request received', { userId: input.userId });

    const user = await this.userRepository.findByIdOrFail(input.userId);
    const canManageUser = (input.currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin();

    if (input.userId === input.currentUser.id || !canManageUser) {
      throw new UnauthorizedException('You cannot manage this user');
    }

    await this.sessionRepository.revokeAllByUserId(input.userId);
  }
}
