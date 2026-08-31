import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type { UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { type ICurrentUser, type UserId } from '@wishlist/common';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccount } from '../../domain/model/user-account.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';

export type UpdateUserFullInput = {
  userId: UserId;
  currentUser: ICurrentUser;
  updateUser: {
    email?: string;
    newPassword?: string;
    firstname?: string;
    lastname?: string;
    birthday?: Date;
    isEnabled?: boolean;
  };
};

@Injectable()
export class UpdateUserFullUseCase {
  private readonly logger = new Logger(UpdateUserFullUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: UpdateUserFullInput): Promise<void> {
    this.logger.log('Update user full request received', { userId: input.userId });
    const { userId, currentUser, updateUser } = input;

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot update yourself');
    }

    let user = await this.userRepository.findByIdOrFail(userId);
    const canUpdateUser = (currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin();

    if (!canUpdateUser) {
      throw new UnauthorizedException('You cannot update this user');
    }

    const updatedFields: string[] = [];
    let passwordAccount: UserAccount | undefined;

    if (updateUser.email && user.email !== updateUser.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(updateUser.email);

      if (userWithSameEmail) {
        throw new BadRequestException('A user already exist with this email');
      }

      user = user.updateEmail(updateUser.email);
      updatedFields.push('email');
    }

    if (updateUser.newPassword) {
      const passwordHash = await PasswordManager.hash(updateUser.newPassword);
      const existingPasswordAccount = await this.userAccountRepository.findByUserIdAndProvider(
        userId,
        UserAccountProvider.PASSWORD,
      );
      passwordAccount = existingPasswordAccount
        ? existingPasswordAccount.updatePasswordHash(passwordHash)
        : UserAccount.createPasswordAccount({
            id: this.userAccountRepository.newId(),
            userId: user.id,
            email: user.email,
            passwordHash,
          });
      updatedFields.push('password');
    }

    if (updateUser.firstname) {
      user = user.updateFirstName(updateUser.firstname);
      updatedFields.push('firstname');
    }

    if (updateUser.lastname) {
      user = user.updateLastName(updateUser.lastname);
      updatedFields.push('lastname');
    }

    if (updateUser.birthday) {
      user = user.updateBirthday(updateUser.birthday);
      updatedFields.push('birthday');
    }

    if (updateUser.isEnabled !== undefined) {
      user = user.updateIsEnabled(updateUser.isEnabled);
      updatedFields.push('isEnabled');
    }

    this.logger.log('Updating user...', { userId, updatedFields });
    const shouldRevokeSessions = Boolean(updateUser.newPassword) || updateUser.isEnabled === false;
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx);
      if (passwordAccount) {
        await this.userAccountRepository.save(passwordAccount, tx);
      }
      if (shouldRevokeSessions) {
        await this.refreshTokenRepository.revokeAllByUserId(userId, { tx });
      }
    });
  }
}
