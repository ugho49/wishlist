import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { SecretSantaStartedEvent } from '../../../secret-santa/domain/event/secret-santa-started.event';
import { UserNotification } from '../../domain/model/user-notification.model';
import { UserNotificationType } from '../../domain/user-notification-type.enum';

@EventsHandler(SecretSantaStartedEvent)
export class SecretSantaStartedNotificationHandler implements IEventHandler<SecretSantaStartedEvent> {
  private readonly logger = new Logger(SecretSantaStartedNotificationHandler.name);

  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async handle(event: SecretSantaStartedEvent): Promise<void> {
    this.logger.log('Creating secret santa drawn notifications', { eventId: event.eventId });

    const userIds = [...new Set(event.drawns.map(drawn => drawn.userId).filter(userId => userId !== undefined))];
    const notifications = userIds.map(userId =>
      UserNotification.create({
        id: this.userNotificationRepository.newId(),
        userId,
        type: UserNotificationType.SECRET_SANTA_DRAWN,
        title: 'Secret Santa tiré au sort',
        body: `Le Secret Santa de ${event.eventTitle} a été tiré. Découvrez à qui vous offrez.`,
        eventId: event.eventId,
      }),
    );

    await this.userNotificationRepository.saveAll(notifications);
  }
}
