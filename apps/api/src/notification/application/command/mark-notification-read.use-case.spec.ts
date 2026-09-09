import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Logger, NotFoundException } from '@nestjs/common';
import { type UserNotificationId, uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserNotificationBuilder } from '../../../../test-utils/builders/user-notification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('MarkNotificationReadUseCase', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  let useCase: MarkNotificationReadUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new MarkNotificationReadUseCase(userNotificationRepository);
  });

  it('should reject when the notification does not belong to the user', async () => {
    const user = new UserBuilder().build();
    userNotificationRepository.findByIdForUser.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute({ currentUser: toCurrentUser(user), notificationId: uuid() as UserNotificationId }),
    ).rejects.toThrow(NotFoundException);
    expect(userNotificationRepository.save).not.toHaveBeenCalled();
  });

  it('should persist the notification as read', async () => {
    const user = new UserBuilder().build();
    const notification = new UserNotificationBuilder().withUserId(user.id).build();
    userNotificationRepository.findByIdForUser.mockResolvedValueOnce(notification);

    await useCase.execute({ currentUser: toCurrentUser(user), notificationId: notification.id });

    const saved = userNotificationRepository.save.mock.calls[0]?.[0];
    expect(saved?.isRead).toBe(true);
    expect(saved?.id).toBe(notification.id);
  });

  it('should do nothing when the notification is already read', async () => {
    const user = new UserBuilder().build();
    const notification = new UserNotificationBuilder().withUserId(user.id).build().markRead();
    userNotificationRepository.findByIdForUser.mockResolvedValueOnce(notification);

    await useCase.execute({ currentUser: toCurrentUser(user), notificationId: notification.id });

    expect(userNotificationRepository.save).not.toHaveBeenCalled();
  });
});
