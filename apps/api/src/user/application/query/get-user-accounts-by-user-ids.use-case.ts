import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccount } from '../../domain/model/user-account.model';

export type GetUserAccountsByUserIdsInput = {
  userIds: UserId[];
};

@Injectable()
export class GetUserAccountsByUserIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
  ) {}

  async execute(query: GetUserAccountsByUserIdsInput): Promise<Map<UserId, UserAccount[]>> {
    const userAccounts = await this.userAccountRepository.findByUserIds(query.userIds);

    return userAccounts.reduce((acc, userAccount) => {
      if (!acc.has(userAccount.userId)) {
        acc.set(userAccount.userId, []);
      }
      acc.get(userAccount.userId)?.push(userAccount);
      return acc;
    }, new Map<UserId, UserAccount[]>());
  }
}
