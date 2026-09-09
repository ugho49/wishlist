import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetUnreadNotificationCountUseCase } from './get-unread-notification-count.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUnreadNotificationCountUseCase', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  const useCase = new GetUnreadNotificationCountUseCase(userNotificationRepository);

  beforeEach(() => {
    mock.clearAllMocks();
  });

  it('should return the unread count for the current user', async () => {
    const user = new UserBuilder().build();
    userNotificationRepository.countUnread.mockResolvedValue(3);

    const result = await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(userNotificationRepository.countUnread).toHaveBeenCalledWith(user.id);
    expect(result).toEqual({ count: 3 });
  });
});
