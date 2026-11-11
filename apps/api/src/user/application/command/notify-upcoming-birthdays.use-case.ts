import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';
import { DateTime } from 'luxon';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';

const BIRTHDAY_REMINDER_LEAD_DAYS = 30;

export function resolveBirthdayReminderTarget(now: DateTime): {
  month: number;
  day: number;
  includeLeapDay: boolean;
} {
  const target = now.plus({ days: BIRTHDAY_REMINDER_LEAD_DAYS });
  const includeLeapDay = !target.isInLeapYear && target.month === 2 && target.day === 28;

  return { month: target.month, day: target.day, includeLeapDay };
}

@Injectable()
export class NotifyUpcomingBirthdaysUseCase {
  private readonly logger = getLogger(NotifyUpcomingBirthdaysUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async execute(now: DateTime = DateTime.now()): Promise<void> {
    const target = resolveBirthdayReminderTarget(now);

    this.logger.info('Fetching users to remind of an upcoming birthday', target);

    const users = await this.userRepository.findEnabledWithBirthdayOn(target);

    if (users.length === 0) {
      this.logger.info('No birthday reminders to send');
      return;
    }

    this.logger.info(`Sending birthday reminder to ${users.length} user(s)`);

    for (const user of users) {
      await this.notify(user);
    }
  }

  private async notify(user: User): Promise<void> {
    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Votre anniversaire est dans 30 jours',
        template: MailTemplate.BIRTHDAY_REMINDER,
        context: {
          firstName: user.firstName,
          createEventUrl: this.frontendRoutes.routes.event.create(),
          createWishlistUrl: this.frontendRoutes.routes.wishlist.create(),
        },
      });
    } catch (error) {
      this.logger.error(`Fail to send birthday reminder to user ${user.id}`, { error: error });
    }
  }
}
