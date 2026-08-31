import type { ICurrentUser, UserId } from '@wishlist/common';

import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRepository } from '../../domain/repository/user.repository';
import { type UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

export type AdminRevokeAllUserSessionsInput = {
  currentUser: ICurrentUser;
  userId: UserId;
};

@Injectable()
export class AdminRevokeAllUserSessionsUseCase {
  private readonly logger = new Logger(AdminRevokeAllUserSessionsUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(input: AdminRevokeAllUserSessionsInput): Promise<void> {
    this.logger.log('Admin revoke all sessions request received', { userId: input.userId });

    const user = await this.userRepository.findByIdOrFail(input.userId);
    const canManageUser = (input.currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin();

    if (input.userId === input.currentUser.id || !canManageUser) {
      throw new UnauthorizedException('You cannot manage this user');
    }

    await this.refreshTokenRepository.revokeAllByUserId(input.userId);
  }
}
