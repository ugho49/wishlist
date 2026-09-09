import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';

import { AttendeeAddedEvent } from '../../../event/domain/event/attendee-added.event';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserNotification } from '../../domain/model/user-notification.model';
import { UserNotificationType } from '../../domain/user-notification-type.enum';

@EventsHandler(AttendeeAddedEvent)
export class AttendeeAddedNotificationHandler implements IEventHandler<AttendeeAddedEvent> {
  private readonly logger = new Logger(AttendeeAddedNotificationHandler.name);

  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async handle(event: AttendeeAddedEvent): Promise<void> {
    this.logger.log('Creating new-guest notifications', { eventId: event.event.id });

    const guestName = event.newAttendee.user
      ? event.newAttendee.user.firstName
      : event.newAttendee.getFullNameOrPendingEmail();
    const guestUserId = event.newAttendee.user?.id;

    const recipientIds = event.event.attendees
      .filter(attendee => attendee.isMaintainer() && attendee.user)
      .map(attendee => attendee.user?.id)
      .filter((userId): userId is NonNullable<typeof userId> => userId !== undefined)
      .filter(userId => userId !== event.invitedBy.id && userId !== guestUserId);

    const uniqueRecipientIds = [...new Set(recipientIds)];
    const notifications = uniqueRecipientIds.map(userId =>
      UserNotification.create({
        id: this.userNotificationRepository.newId(),
        userId,
        type: UserNotificationType.NEW_GUEST,
        title: 'Nouvel invité',
        body: `${guestName} a rejoint ${event.event.title}`,
        eventId: event.event.id,
      }),
    );

    await this.userNotificationRepository.saveAll(notifications);
  }
}
