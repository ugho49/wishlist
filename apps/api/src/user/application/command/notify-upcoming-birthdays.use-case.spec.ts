import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';
import { DateTime } from 'luxon';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { NotifyUpcomingBirthdaysUseCase } from './notify-upcoming-birthdays.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('NotifyUpcomingBirthdaysUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const mailService = createMock<MailService>();
  const frontendRoutes = createMock<FrontendRoutesService>({
    routes: {
      event: { create: () => 'https://app/events/new' },
      wishlist: { create: () => 'https://app/wishlists/new' },
    },
  } as never);

  let useCase: NotifyUpcomingBirthdaysUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    userRepository.findEnabledWithBirthdayOn.mockResolvedValue([]);
    useCase = new NotifyUpcomingBirthdaysUseCase(userRepository, mailService, frontendRoutes);
  });

  it('should do nothing when no birthday matches', async () => {
    await useCase.execute(DateTime.fromISO('2026-06-01'));

    expect(userRepository.findEnabledWithBirthdayOn).toHaveBeenCalledWith({
      month: 7,
      day: 1,
      includeLeapDay: false,
    });
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should include February 29 when the reminder day is February 28 in a non-leap year', async () => {
    await useCase.execute(DateTime.fromISO('2026-01-29'));

    expect(userRepository.findEnabledWithBirthdayOn).toHaveBeenCalledWith({
      month: 2,
      day: 28,
      includeLeapDay: true,
    });
  });

  it('should target February 29 itself during a leap year', async () => {
    await useCase.execute(DateTime.fromISO('2024-01-30'));

    expect(userRepository.findEnabledWithBirthdayOn).toHaveBeenCalledWith({
      month: 2,
      day: 29,
      includeLeapDay: false,
    });
  });

  it('should send a reminder with the event and wishlist links', async () => {
    const user = new UserBuilder()
      .withEmail('marie@test.fr')
      .withName({ firstName: 'Marie', lastName: 'Martin' })
      .build();
    userRepository.findEnabledWithBirthdayOn.mockResolvedValueOnce([user]);

    await useCase.execute(DateTime.fromISO('2026-06-01'));

    expect(mailService.sendMail).toHaveBeenCalledWith({
      to: 'marie@test.fr',
      subject: 'Votre anniversaire est dans 30 jours',
      template: MailTemplate.BIRTHDAY_REMINDER,
      context: {
        firstName: 'Marie',
        createEventUrl: 'https://app/events/new',
        createWishlistUrl: 'https://app/wishlists/new',
      },
    });
  });

  it('should continue when one reminder fails to send', async () => {
    const first = new UserBuilder().withEmail('a@test.fr').build();
    const second = new UserBuilder().withEmail('b@test.fr').build();
    userRepository.findEnabledWithBirthdayOn.mockResolvedValueOnce([first, second]);
    mailService.sendMail.mockRejectedValueOnce(new Error('smtp down'));

    await expect(useCase.execute(DateTime.fromISO('2026-06-01'))).resolves.toBeUndefined();
    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
  });
});
