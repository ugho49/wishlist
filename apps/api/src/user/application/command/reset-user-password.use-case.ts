import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';
import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccount } from '../../domain/model/user-account.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';

export type ResetUserPasswordInput = {
  email: string;
  token: string;
  newPassword: string;
};

@Injectable()
export class ResetUserPasswordUseCase {
  private readonly logger = new Logger(ResetUserPasswordUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    @Inject(REPOSITORIES.USER_PASSWORD_VERIFICATION)
    private readonly passwordVerificationRepository: UserPasswordVerificationRepository,
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: ResetUserPasswordInput): Promise<void> {
    this.logger.log('Reset user password request received', { email: input.email, token: input.token });
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordVerifications = await this.passwordVerificationRepository.findByUserId(user.id);

    const passwordVerification = passwordVerifications.find(verification => verification.token === input.token);

    if (!passwordVerification) {
      throw new UnauthorizedException('This reset code is not valid');
    }

    if (passwordVerification.isExpired()) {
      throw new UnauthorizedException('This reset code is expired');
    }

    const passwordHash = await PasswordManager.hash(input.newPassword);
    const existingPasswordAccount = await this.userAccountRepository.findByUserIdAndProvider(
      user.id,
      UserAccountProvider.PASSWORD,
    );
    const passwordAccount = existingPasswordAccount
      ? existingPasswordAccount.updatePasswordHash(passwordHash)
      : UserAccount.createPasswordAccount({
          id: this.userAccountRepository.newId(),
          userId: user.id,
          email: user.email,
          passwordHash,
        });

    this.logger.log('Saving password account and deleting password verification...', { userId: user.id });
    await this.transactionManager.runInTransaction(async tx => {
      await this.userAccountRepository.save(passwordAccount, tx);
      await this.passwordVerificationRepository.delete(passwordVerification.id, tx);
      await this.sessionRepository.revokeAllByUserId(user.id, { tx });
    });
  }
}
