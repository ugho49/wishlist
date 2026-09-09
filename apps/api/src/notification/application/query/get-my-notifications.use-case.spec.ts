import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserNotificationBuilder } from '../../../../test-utils/builders/user-notification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetMyNotificationsUseCase } from './get-my-notifications.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetMyNotificationsUseCase', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  const useCase = new GetMyNotificationsUseCase(userNotificationRepository);

  beforeEach(() => {
    mock.clearAllMocks();
  });

  it('should return the paginated notifications and unread count', async () => {
    const user = new UserBuilder().build();
    const notification = new UserNotificationBuilder().withUserId(user.id).build();
    userNotificationRepository.findByUserIdPaginated.mockResolvedValue({
      notifications: [notification],
      totalCount: 1,
    });
    userNotificationRepository.countUnread.mockResolvedValue(1);

    const result = await useCase.execute({
      currentUser: toCurrentUser(user),
      pageNumber: 2,
      pageSize: 10,
    });

    expect(userNotificationRepository.findByUserIdPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 10 },
    });
    expect(result).toEqual({ notifications: [notification], totalCount: 1, unreadCount: 1 });
  });
});
