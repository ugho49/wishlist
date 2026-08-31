import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { type UserAccountRepository } from '../../domain/repository/user-account.repository';
import { GetUserAccountsByIdsUseCase } from './get-user-accounts-by-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUserAccountsByIdsUseCase', () => {
  const userAccountRepository = createMock<UserAccountRepository>();
  let useCase: GetUserAccountsByIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetUserAccountsByIdsUseCase(userAccountRepository);
  });

  it('should return accounts matching the given ids', async () => {
    const user = new UserBuilder().build();
    const account = new UserAccountBuilder().withUser(user).withGoogle('google-1').build();
    userAccountRepository.findByIds.mockResolvedValueOnce([account]);

    const result = await useCase.execute({ userAccountIds: [account.id] });

    expect(result).toEqual([account]);
  });
});
