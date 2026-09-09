import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Logger } from '@nestjs/common';
import { type UserNotificationId, uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { SecretSantaStartedEvent } from '../../../secret-santa/domain/event/secret-santa-started.event';
import { UserNotificationType } from '../../domain/user-notification-type.enum';
import { SecretSantaStartedNotificationHandler } from './secret-santa-started-notification.handler';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('SecretSantaStartedNotificationHandler', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  let handler: SecretSantaStartedNotificationHandler;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    userNotificationRepository.newId.mockImplementation(() => uuid() as UserNotificationId);
    handler = new SecretSantaStartedNotificationHandler(userNotificationRepository);
  });

  it('should create an in-app notification for every drawn user', async () => {
    const first = new UserBuilder().build();
    const second = new UserBuilder().build();
    const eventId = uuid();

    await handler.handle(
      new SecretSantaStartedEvent({
        eventId,
        eventTitle: 'Noël',
        drawns: [
          { email: first.email, userId: first.id },
          { email: second.email, userId: second.id },
          { email: 'pending@test.fr' },
        ],
      }),
    );

    const saved = userNotificationRepository.saveAll.mock.calls[0]?.[0] ?? [];
    expect(saved.map(notification => notification.userId).toSorted()).toEqual([first.id, second.id].toSorted());
    expect(saved[0]).toMatchObject({
      type: UserNotificationType.SECRET_SANTA_DRAWN,
      eventId,
    });
  });
});
