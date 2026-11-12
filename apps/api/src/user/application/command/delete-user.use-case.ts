import type { UserRepository } from '../../domain/repository/user.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

export type DeleteUserInput = {
  currentUser: ICurrentUser;
  userId: UserId;
};

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = getLogger(DeleteUserUseCase.name);

  constructor(private readonly userRepository: UserRepository) {}

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

    this.logger.info('Deleting user...', { userId });
    await this.userRepository.delete(userId);
  }
}
