import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type UserAccountId, type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';

export type UnlinkUserAccountInput = {
  userId: UserId;
  accountId: UserAccountId;
};

@Injectable()
export class UnlinkUserAccountUseCase {
  private readonly logger = new Logger(UnlinkUserAccountUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
  ) {}

  async execute(input: UnlinkUserAccountInput): Promise<void> {
    this.logger.log('Unlink user account request received', { input });
    const { userId, accountId } = input;

    const accounts = await this.userAccountRepository.findByUserId(userId);
    const account = accounts.find(item => item.id === accountId);

    if (!account) throw new NotFoundException('This account id does not exist');

    if (account.provider === UserAccountProvider.PASSWORD) {
      throw new BadRequestException('Cannot unlink a password account');
    }

    this.logger.log('Deleting user account...', { userId, accountId });
    await this.userAccountRepository.delete(accountId);
  }
}
