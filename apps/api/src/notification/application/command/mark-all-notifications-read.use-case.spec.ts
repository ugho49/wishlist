import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { MarkAllNotificationsReadUseCase } from './mark-all-notifications-read.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('MarkAllNotificationsReadUseCase', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  let useCase: MarkAllNotificationsReadUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new MarkAllNotificationsReadUseCase(userNotificationRepository);
  });

  it('should mark every unread notification of the current user as read', async () => {
    const user = new UserBuilder().build();

    await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(userNotificationRepository.markAllRead).toHaveBeenCalledWith(user.id);
  });
});
