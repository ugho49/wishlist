import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { type UserAccountId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { UserAccount } from '../../domain/model/user-account.model';

export type GetUserAccountsByIdsInput = {
  userAccountIds: UserAccountId[];
};

@Injectable()
export class GetUserAccountsByIdsUseCase {
  constructor(private readonly userAccountRepository: UserAccountRepository) {}

  execute(input: GetUserAccountsByIdsInput): Promise<UserAccount[]> {
    return this.userAccountRepository.findByIds(input.userAccountIds);
  }
}
