import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type { UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';

export type UpdateUserPasswordInput = {
  currentUser: ICurrentUser;
  oldPassword: string;
  newPassword: string;
};

@Injectable()
export class UpdateUserPasswordUseCase {
  private readonly logger = new Logger(UpdateUserPasswordUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(input: UpdateUserPasswordInput): Promise<void> {
    this.logger.log('Update user password request received', { userId: input.currentUser.id });
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

    this.logger.log('Saving password account...', { userId, updatedFields: ['password'] });
    await this.userAccountRepository.save(updatedAccount);
    await this.refreshTokenRepository.revokeAllByUserId(userId, { exceptId: currentUser.sessionId });
  }
}
