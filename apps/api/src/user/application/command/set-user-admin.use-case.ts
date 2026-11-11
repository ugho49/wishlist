import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';

export type SetUserAdminInput = {
  currentUser: ICurrentUser;
  userId: UserId;
  isAdmin: boolean;
};

@Injectable()
export class SetUserAdminUseCase {
  private readonly logger = getLogger(SetUserAdminUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: SetUserAdminInput): Promise<void> {
    this.logger.info('Set user admin request received', { userId: input.userId, isAdmin: input.isAdmin });
    const { userId, currentUser, isAdmin } = input;

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot update yourself');
    }

    if (!currentUser.isSuperAdmin) {
      throw new UnauthorizedException('Only a super-admin can change admin status');
    }

    const user = await this.userRepository.findByIdOrFail(userId);

    if (user.isSuperAdmin()) {
      throw new UnauthorizedException('You cannot update this user');
    }

    const updatedUser = isAdmin ? user.grantAdmin() : user.revokeAdmin();

    if (updatedUser === user) {
      this.logger.info('User admin status already up to date', { userId, isAdmin });
      return;
    }

    this.logger.info('Updating user admin status...', { userId, isAdmin });
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(updatedUser, tx);
      if (!isAdmin) {
        await this.sessionRepository.revokeAllByUserId(userId, { tx });
      }
    });
  }
}
