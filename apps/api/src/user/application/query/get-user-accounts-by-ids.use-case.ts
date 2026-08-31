import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserAccountId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccount } from '../../domain/model/user-account.model';

export type GetUserAccountsByIdsInput = {
  userAccountIds: UserAccountId[];
};

@Injectable()
export class GetUserAccountsByIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
  ) {}

  execute(input: GetUserAccountsByIdsInput): Promise<UserAccount[]> {
    return this.userAccountRepository.findByIds(input.userAccountIds);
  }
}
