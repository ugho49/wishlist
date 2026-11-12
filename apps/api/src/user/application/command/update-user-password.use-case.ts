import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';

export type UpdateUserPasswordInput = {
  currentUser: ICurrentUser;
  oldPassword: string;
  newPassword: string;
};

@Injectable()
export class UpdateUserPasswordUseCase {
  private readonly logger = getLogger(UpdateUserPasswordUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(input: UpdateUserPasswordInput): Promise<void> {
    this.logger.info('Update user password request received', { userId: input.currentUser.id });
    const { currentUser, oldPassword, newPassword } = input;
    const userId = currentUser.id;

    await this.userRepository.findByIdOrFail(userId);
    const passwordAccount = await this.userAccountRepository.findByUserIdAndProvider(
      userId,
      UserAccountProvider.PASSWORD,
    );
    const oldPasswordMatch = await PasswordManager.verify({
      hash: passwordAccount?.passwordHash,
      plainPassword: oldPassword,
    });

    if (!oldPasswordMatch || !passwordAccount) {
      throw new BusinessRuleException('WRONG_OLD_PASSWORD', "Old password don't match with user password");
    }

    const updatedAccount = passwordAccount.updatePasswordHash(await PasswordManager.hash(newPassword));

    this.logger.info('Saving password account...', { userId, updatedFields: ['password'] });
    await this.userAccountRepository.save(updatedAccount);
    await this.sessionRepository.revokeAllByUserId(userId, { exceptId: currentUser.sessionId });
  }
}
