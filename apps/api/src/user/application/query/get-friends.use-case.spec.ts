import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetFriendsUseCase } from './get-friends.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetFriendsUseCase', () => {
  const userContactRepository = createMock<UserContactRepository>();

  let useCase: GetFriendsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetFriendsUseCase(userContactRepository);
  });

  it('should return the circle and the hidden users of the current user', async () => {
    const currentUser = new UserBuilder().build();
    const friend = { user: new UserBuilder().build(), added: false, sharedEventsCount: 2 };
    const hidden = new UserBuilder().build();
    userContactRepository.findFriends.mockResolvedValueOnce([friend]);
    userContactRepository.findHiddenUsers.mockResolvedValueOnce([hidden]);

    const result = await useCase.execute({ currentUser: toCurrentUser(currentUser) });

    expect(result).toEqual({ friends: [friend], hidden: [hidden] });
    expect(userContactRepository.findFriends).toHaveBeenCalledWith(currentUser.id);
    expect(userContactRepository.findHiddenUsers).toHaveBeenCalledWith(currentUser.id);
  });
});
