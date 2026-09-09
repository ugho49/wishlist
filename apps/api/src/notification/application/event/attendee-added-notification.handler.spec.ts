import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Logger } from '@nestjs/common';
import { type UserNotificationId, uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { AttendeeRole } from '../../../event/domain/attendee-role.enum';
import { AttendeeAddedEvent } from '../../../event/domain/event/attendee-added.event';
import { EventAttendee } from '../../../event/domain/model/event-attendee.model';
import { UserNotificationType } from '../../domain/user-notification-type.enum';
import { AttendeeAddedNotificationHandler } from './attendee-added-notification.handler';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AttendeeAddedNotificationHandler', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  let handler: AttendeeAddedNotificationHandler;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    userNotificationRepository.newId.mockImplementation(() => uuid() as UserNotificationId);
    handler = new AttendeeAddedNotificationHandler(userNotificationRepository);
  });

  it('should notify maintainers except the inviter and the new guest', async () => {
    const creator = new UserBuilder().withEmail('creator@test.fr').build();
    const admin = new UserBuilder().withEmail('admin@test.fr').build();
    const guest = new UserBuilder().withName({ firstName: 'Marie', lastName: 'Dupont' }).build();
    const event = new EventBuilder().withCreator(creator).withAttendee(admin, AttendeeRole.ADMIN).build();
    const newAttendee = EventAttendee.createFromExistingUser({
      id: uuid(),
      eventId: event.id,
      user: guest,
      role: AttendeeRole.PARTICIPANT,
    });

    await handler.handle(new AttendeeAddedEvent({ event, newAttendee, invitedBy: creator }));

    const saved = userNotificationRepository.saveAll.mock.calls[0]?.[0] ?? [];
    expect(saved.map(notification => notification.userId)).toEqual([admin.id]);
    expect(saved[0]).toMatchObject({
      type: UserNotificationType.NEW_GUEST,
      body: `Marie a rejoint ${event.title}`,
    });
  });

  it('should notify the creator when a guest self-joins via invite', async () => {
    const creator = new UserBuilder().withEmail('creator@test.fr').build();
    const guest = new UserBuilder().withName({ firstName: 'Paul', lastName: 'Martin' }).build();
    const event = new EventBuilder().withCreator(creator).build();
    const newAttendee = EventAttendee.createFromExistingUser({
      id: uuid(),
      eventId: event.id,
      user: guest,
      role: AttendeeRole.PARTICIPANT,
    });

    await handler.handle(new AttendeeAddedEvent({ event, newAttendee, invitedBy: guest }));

    const saved = userNotificationRepository.saveAll.mock.calls[0]?.[0] ?? [];
    expect(saved.map(notification => notification.userId)).toEqual([creator.id]);
  });
});
