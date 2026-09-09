import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Logger } from '@nestjs/common';
import { type UserNotificationId, uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { ItemReservedEvent } from '../../../item/domain/event/item-reserved.event';
import { UserNotificationType } from '../../domain/user-notification-type.enum';
import { ItemReservedHandler } from './item-reserved.handler';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('ItemReservedHandler', () => {
  const userNotificationRepository = createMock<UserNotificationRepository>();
  const eventRepository = createMock<EventRepository>();
  let handler: ItemReservedHandler;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    userNotificationRepository.newId.mockImplementation(() => uuid() as UserNotificationId);
    handler = new ItemReservedHandler(userNotificationRepository, eventRepository);
  });

  it('should notify other attendees and hide the reservation from the owner when hideItems is on', async () => {
    const owner = new UserBuilder().withEmail('owner@test.fr').build();
    const actor = new UserBuilder().withName({ firstName: 'Marie', lastName: 'Dupont' }).build();
    const other = new UserBuilder().withEmail('other@test.fr').build();
    const event = new EventBuilder().withCreator(owner).withAttendee(actor).withAttendee(other).build();
    eventRepository.findByIds.mockResolvedValueOnce([event]);

    await handler.handle(
      new ItemReservedEvent({
        itemId: uuid(),
        itemName: 'Lego',
        wishlistId: uuid(),
        wishlistTitle: 'Liste Marie',
        hideItems: true,
        ownerId: owner.id,
        eventIds: [event.id],
        actorId: actor.id,
        actorFirstName: 'Marie',
      }),
    );

    const saved = userNotificationRepository.saveAll.mock.calls[0]?.[0] ?? [];
    expect(saved.map(notification => notification.userId)).toEqual([other.id]);
    expect(saved[0]).toMatchObject({
      type: UserNotificationType.ITEM_RESERVED,
      title: 'Souhait réservé',
      body: 'Marie a réservé « Lego » sur la liste « Liste Marie »',
    });
  });

  it('should do nothing when the wishlist is not linked to an event', async () => {
    await handler.handle(
      new ItemReservedEvent({
        itemId: uuid(),
        itemName: 'Lego',
        wishlistId: uuid(),
        wishlistTitle: 'Liste',
        hideItems: true,
        ownerId: uuid(),
        eventIds: [],
        actorId: uuid(),
        actorFirstName: 'Marie',
      }),
    );

    expect(eventRepository.findByIds).not.toHaveBeenCalled();
    expect(userNotificationRepository.saveAll).not.toHaveBeenCalled();
  });
});
