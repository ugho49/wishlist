import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { type UserAccountRepository } from '../../domain/repository/user-account.repository';
import { GetUserAccountsByUserIdsUseCase } from './get-user-accounts-by-user-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUserAccountsByUserIdsUseCase', () => {
  const userAccountRepository = createMock<UserAccountRepository>();
  let useCase: GetUserAccountsByUserIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetUserAccountsByUserIdsUseCase(userAccountRepository);
  });

  it('should group social accounts by user id and exclude password accounts', async () => {
    const user = new UserBuilder().build();
    const googleAccount = new UserAccountBuilder().withUser(user).withGoogle('google-1').build();
    const passwordAccount = new UserAccountBuilder().buildPassword(user, 'hash');
    userAccountRepository.findByUserIds.mockResolvedValueOnce([googleAccount, passwordAccount]);

    const result = await useCase.execute({ userIds: [user.id] });

    expect(result.get(user.id)).toEqual([googleAccount]);
  });
});
