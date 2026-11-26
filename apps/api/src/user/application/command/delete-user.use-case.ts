import type { SecretSantaRepository } from '../../../secret-santa/domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../../secret-santa/domain/repository/secret-santa-user.repository';
import type { UserRepository } from '../../domain/repository/user.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { TransactionManager } from '../../../core/database/transaction-manager';

export type DeleteUserInput = {
  currentUser: ICurrentUser;
  userId: UserId;
};

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = getLogger(DeleteUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: DeleteUserInput): Promise<void> {
    this.logger.info('Delete user request received', { input });
    const { userId, currentUser } = input;

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot delete yourself');
    }

    const userToDelete = await this.userRepository.findByIdOrFail(userId);

    const canDeleteUser = (currentUser.isSuperAdmin && !userToDelete.isSuperAdmin()) || !userToDelete.isAdmin();

    if (!canDeleteUser) {
      throw new UnauthorizedException('You cannot delete this user');
    }

    // A secret santa participation references the user's attendee without cascade: leave the secret
    // santas that are not drawn yet, refuse when a draw is running (removing someone breaks the chain).
    const participations = await this.secretSantaUserRepository.findByUserId(userId);
    const secretSantas = await Promise.all(
      participations.map(participation => this.secretSantaRepository.findByIdOrFail(participation.secretSantaId)),
    );

    if (secretSantas.some(secretSanta => secretSanta.isStarted())) {
      throw new BusinessRuleException(
        'USER_IN_STARTED_SECRET_SANTA',
        'This user takes part in a secret santa whose draw has started: cancel the draw before deleting the user',
      );
    }

    await this.transactionManager.runInTransaction(async tx => {
      for (const participation of participations) {
        this.logger.info('Removing user from secret santa...', {
          userId,
          secretSantaId: participation.secretSantaId,
          secretSantaUserId: participation.id,
        });
        await this.secretSantaUserRepository.delete(participation.id, tx);
      }

      this.logger.info('Deleting user...', { userId });
      await this.userRepository.delete(userId, tx);
    });
  }
}
