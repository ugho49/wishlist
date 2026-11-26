import type { UserRepository } from '../../domain/repository/user.repository';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { FindUserByEmailUseCase } from './find-user-by-email.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('FindUserByEmailUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: FindUserByEmailUseCase;
  let currentUser: User;
  let otherUser: User;

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().withEmail('jean@test.fr').build();
    otherUser = new UserBuilder().withEmail('paul@test.fr').build();
    userRepository.findByEmail.mockResolvedValue(otherUser);

    useCase = new FindUserByEmailUseCase(userRepository);
  });

  it('should return the user owning the email', async () => {
    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr' });

    expect(user).toEqual(otherUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('paul@test.fr');
  });

  it('should return no user when the email has no account', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'nobody@test.fr' });

    expect(user).toBeUndefined();
  });

  it('should return no user when the account is disabled', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('off@test.fr').disabled().build());

    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'off@test.fr' });

    expect(user).toBeUndefined();
  });

  it('should return no user when the email is the one of the current user', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(currentUser);

    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'jean@test.fr' });

    expect(user).toBeUndefined();
  });
});
