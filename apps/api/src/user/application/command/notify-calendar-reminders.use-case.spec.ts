import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Logger } from '@nestjs/common';
import { DateTime } from 'luxon';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { CALENDAR_REMINDER_TIMEZONE, NotifyCalendarRemindersUseCase } from './notify-calendar-reminders.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('NotifyCalendarRemindersUseCase', () => {
  const userEmailSettingRepository = createMock<UserEmailSettingRepository>();
  const mailService = createMock<MailService>();
  const frontendRoutes = createMock<FrontendRoutesService>({
    routes: {
      wishlist: { list: () => 'https://app/wishlists' },
      event: { list: () => 'https://app/events' },
    },
  } as never);

  let useCase: NotifyCalendarRemindersUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    userEmailSettingRepository.findUsersForBirthdayReminder.mockResolvedValue([]);
    userEmailSettingRepository.findUsersForChristmasReminder.mockResolvedValue([]);
    useCase = new NotifyCalendarRemindersUseCase(userEmailSettingRepository, mailService, frontendRoutes);
  });

  it('should do nothing on a day that is neither a birthday window nor a Christmas window', async () => {
    await useCase.execute({ now: parisDate(2026, 6, 1) });

    expect(userEmailSettingRepository.findUsersForBirthdayReminder).toHaveBeenCalledTimes(2);
    expect(userEmailSettingRepository.findUsersForChristmasReminder).not.toHaveBeenCalled();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should email users whose birthday is in 30 days', async () => {
    const marie = new UserBuilder()
      .withEmail('marie@test.fr')
      .withName({ firstName: 'Marie', lastName: 'Dupont' })
      .withBirthday(new Date('1990-07-01'))
      .build();
    userEmailSettingRepository.findUsersForBirthdayReminder.mockImplementation(async ({ month, day }) =>
      month === 7 && day === 1 ? [marie] : [],
    );

    await useCase.execute({ now: parisDate(2026, 6, 1) });

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'marie@test.fr',
      subject: 'Votre anniversaire est dans 30 jours',
      template: MailTemplate.CALENDAR_REMINDER,
      context: {
        firstName: 'Marie',
        kind: 'birthday',
        daysLeft: 30,
        actionUrl: 'https://app/wishlists',
      },
    });
  });

  it('should email users whose birthday is in 7 days', async () => {
    const paul = new UserBuilder()
      .withEmail('paul@test.fr')
      .withName({ firstName: 'Paul', lastName: 'Martin' })
      .build();
    userEmailSettingRepository.findUsersForBirthdayReminder.mockImplementation(async ({ month, day }) =>
      month === 6 && day === 8 ? [paul] : [],
    );

    await useCase.execute({ now: parisDate(2026, 6, 1) });

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'paul@test.fr',
      subject: 'Votre anniversaire est dans 7 jours',
      template: MailTemplate.CALENDAR_REMINDER,
      context: { kind: 'birthday', daysLeft: 7 },
    });
  });

  it('should email everyone with the Christmas pref on 25 November (J-30)', async () => {
    const jean = new UserBuilder()
      .withEmail('jean@test.fr')
      .withName({ firstName: 'Jean', lastName: 'Dupont' })
      .build();
    userEmailSettingRepository.findUsersForChristmasReminder.mockResolvedValue([jean]);

    await useCase.execute({ now: parisDate(2026, 11, 25) });

    expect(userEmailSettingRepository.findUsersForChristmasReminder).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jean@test.fr',
        subject: 'Noël est dans 30 jours',
        template: MailTemplate.CALENDAR_REMINDER,
        context: {
          firstName: 'Jean',
          kind: 'christmas',
          daysLeft: 30,
          actionUrl: 'https://app/events',
        },
      }),
    );
  });

  it('should email everyone with the Christmas pref on 18 December (J-7)', async () => {
    const jean = new UserBuilder().withEmail('jean@test.fr').build();
    userEmailSettingRepository.findUsersForChristmasReminder.mockResolvedValue([jean]);

    await useCase.execute({ now: parisDate(2026, 12, 18) });

    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Noël est dans 7 jours',
        context: expect.objectContaining({ kind: 'christmas', daysLeft: 7 }),
      }),
    );
  });

  it('should not send Christmas emails on other December days', async () => {
    await useCase.execute({ now: parisDate(2026, 12, 20) });

    expect(userEmailSettingRepository.findUsersForChristmasReminder).not.toHaveBeenCalled();
  });

  it('should send both a birthday and a Christmas email when they coincide', async () => {
    const bornOnChristmas = new UserBuilder()
      .withEmail('noel@test.fr')
      .withName({ firstName: 'Noël', lastName: 'Martin' })
      .build();
    userEmailSettingRepository.findUsersForBirthdayReminder.mockImplementation(async ({ month, day }) =>
      month === 12 && day === 25 ? [bornOnChristmas] : [],
    );
    userEmailSettingRepository.findUsersForChristmasReminder.mockResolvedValue([bornOnChristmas]);

    await useCase.execute({ now: parisDate(2026, 11, 25) });

    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    expect(mailService.sendMail.mock.calls.map(call => call[0]?.context)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'birthday', daysLeft: 30 }),
        expect.objectContaining({ kind: 'christmas', daysLeft: 30 }),
      ]),
    );
  });

  it('should swallow errors from fetching recipients', async () => {
    userEmailSettingRepository.findUsersForBirthdayReminder.mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute({ now: parisDate(2026, 6, 1) })).resolves.toBeUndefined();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should swallow a single recipient mail error and continue', async () => {
    const first = new UserBuilder().withEmail('a@test.fr').build();
    const second = new UserBuilder().withEmail('b@test.fr').build();
    userEmailSettingRepository.findUsersForChristmasReminder.mockResolvedValue([first, second]);
    mailService.sendMail.mockRejectedValueOnce(new Error('smtp down')).mockResolvedValueOnce(undefined);

    await useCase.execute({ now: parisDate(2026, 11, 25) });

    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
  });
});

function parisDate(year: number, month: number, day: number): Date {
  return DateTime.fromObject({ year, month, day }, { zone: CALENDAR_REMINDER_TIMEZONE }).toJSDate();
}
