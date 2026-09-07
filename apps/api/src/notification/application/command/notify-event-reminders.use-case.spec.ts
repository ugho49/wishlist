import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Logger } from '@nestjs/common';
import { type UserNotificationId, uuid } from '@wishlist/common';
import { DateTime } from 'luxon';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { CALENDAR_REMINDER_TIMEZONE } from '../../../user/application/command/notify-calendar-reminders.use-case';
import { UserNotificationType } from '../../domain/user-notification-type.enum';
import { NotifyEventRemindersUseCase } from './notify-event-reminders.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('NotifyEventRemindersUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const userNotificationRepository = createMock<UserNotificationRepository>();
  const mailService = createMock<MailService>();
  const frontendRoutes = createMock<FrontendRoutesService>({
    routes: { event: { byId: (id: string) => `https://app/events/${id}` } },
  } as never);

  let useCase: NotifyEventRemindersUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    eventRepository.findByEventDate.mockResolvedValue([]);
    userNotificationRepository.newId.mockImplementation(() => uuid() as UserNotificationId);
    useCase = new NotifyEventRemindersUseCase(eventRepository, userNotificationRepository, mailService, frontendRoutes);
  });

  it('should do nothing when no event is in 7 days', async () => {
    await useCase.execute({ now: parisDate(2026, 6, 1) });

    expect(eventRepository.findByEventDate).toHaveBeenCalledWith('2026-06-08');
    expect(mailService.sendMail).not.toHaveBeenCalled();
    expect(userNotificationRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should email and persist an in-app notification for each linked attendee', async () => {
    const creator = new UserBuilder().withName({ firstName: 'Jean', lastName: 'Dupont' }).build();
    const guest = new UserBuilder()
      .withEmail('marie@test.fr')
      .withName({ firstName: 'Marie', lastName: 'Martin' })
      .build();
    const event = new EventBuilder().withTitle('Noël').withCreator(creator).withAttendee(guest).build();
    eventRepository.findByEventDate.mockResolvedValueOnce([event]);

    await useCase.execute({ now: parisDate(2026, 12, 18) });

    expect(eventRepository.findByEventDate).toHaveBeenCalledWith('2026-12-25');
    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: creator.email,
      subject: 'Noël est dans 7 jours',
      template: MailTemplate.EVENT_REMINDER,
      context: {
        firstName: 'Jean',
        eventTitle: 'Noël',
        eventUrl: `https://app/events/${event.id}`,
      },
    });

    const saved = userNotificationRepository.saveAll.mock.calls[0]?.[0] ?? [];
    expect(saved).toHaveLength(2);
    expect(saved[0]).toMatchObject({
      type: UserNotificationType.EVENT_REMINDER,
      title: 'Noël dans 7 jours',
      eventId: event.id,
    });
  });

  it('should swallow errors from fetching events', async () => {
    eventRepository.findByEventDate.mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute({ now: parisDate(2026, 6, 1) })).resolves.toBeUndefined();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });
});

function parisDate(year: number, month: number, day: number): Date {
  return DateTime.fromObject({ year, month, day }, { zone: CALENDAR_REMINDER_TIMEZONE }).toJSDate();
}
