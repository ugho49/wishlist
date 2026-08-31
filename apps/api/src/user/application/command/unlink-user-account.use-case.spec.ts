import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserAccount } from '../../domain/model/user-account.model';
import { UnlinkUserAccountUseCase } from './unlink-user-account.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UnlinkUserAccountUseCase', () => {
  const userAccountRepository = createMock<UserAccountRepository>();

  let useCase: UnlinkUserAccountUseCase;
  let user: User;
  let account: UserAccount;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    account = new UserAccountBuilder().withUser(user).withGoogle('google-123').build();
    userAccountRepository.findByUserId.mockResolvedValue([account]);

    useCase = new UnlinkUserAccountUseCase(userAccountRepository);
  });

  it('should reject when the account id does not exist', async () => {
    await expect(
      useCase.execute({ userId: user.id, accountId: new UserAccountBuilder().withUser(user).build().id }),
    ).rejects.toThrow(NotFoundException);
    expect(userAccountRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when unlinking a password account', async () => {
    const passwordAccount = new UserAccountBuilder().buildPassword(user, 'hash');
    userAccountRepository.findByUserId.mockResolvedValueOnce([passwordAccount]);

    await expect(useCase.execute({ userId: user.id, accountId: passwordAccount.id })).rejects.toThrow(
      BadRequestException,
    );
    expect(userAccountRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete the social account', async () => {
    await useCase.execute({ userId: user.id, accountId: account.id });

    expect(userAccountRepository.delete).toHaveBeenCalledWith(account.id);
  });
});
