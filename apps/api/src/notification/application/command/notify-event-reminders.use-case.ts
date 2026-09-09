import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type EventId, type UserId } from '@wishlist/common';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { Event } from '../../../event/domain/model/event.model';
import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { toParisDate } from '../../../user/application/command/notify-calendar-reminders.use-case';
import { UserNotification } from '../../domain/model/user-notification.model';
import { UserNotificationType } from '../../domain/user-notification-type.enum';

export type NotifyEventRemindersInput = {
  now?: Date;
};

@Injectable()
export class NotifyEventRemindersUseCase {
  private readonly logger = new Logger(NotifyEventRemindersUseCase.name);

  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async execute(input: NotifyEventRemindersInput = {}): Promise<void> {
    try {
      const today = toParisDate(input.now);
      const target = today.plus({ days: 7 }).toISODate();
      if (!target) {
        return;
      }

      this.logger.log(`Checking J-7 event reminders for ${target} ...`);
      const events = await this.eventRepository.findByEventDate(target);

      for (const event of events) {
        await this.notifyEvent(event);
      }
    } catch (e) {
      this.logger.error('Fail to send event reminders', e);
    }
  }

  private async notifyEvent(event: Event) {
    const eventUrl = this.frontendRoutes.routes.event.byId(event.id);
    const notifications: UserNotification[] = [];

    for (const attendee of event.attendees) {
      const user = attendee.user;
      if (!user) continue;

      notifications.push(this.buildNotification(event.id, event.title, user.id));

      try {
        await this.mailService.sendMail({
          to: user.email,
          subject: `${event.title} est dans 7 jours`,
          template: MailTemplate.EVENT_REMINDER,
          context: {
            firstName: user.firstName,
            eventTitle: event.title,
            eventUrl,
          },
        });
      } catch (e) {
        this.logger.error(`Fail to email event reminder to ${user.id}`, e);
      }
    }

    await this.userNotificationRepository.saveAll(notifications);
  }

  private buildNotification(eventId: EventId, eventTitle: string, userId: UserId): UserNotification {
    return UserNotification.create({
      id: this.userNotificationRepository.newId(),
      userId,
      type: UserNotificationType.EVENT_REMINDER,
      title: `${eventTitle} dans 7 jours`,
      body: `L’événement ${eventTitle} a lieu dans 7 jours.`,
      eventId,
    });
  }
}
