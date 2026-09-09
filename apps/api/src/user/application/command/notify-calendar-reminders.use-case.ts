import type { User } from '../../domain/model/user.model';
import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export const CALENDAR_REMINDER_TIMEZONE = 'Europe/Paris';

export type CalendarReminderKind = 'birthday' | 'christmas';
export type CalendarReminderDaysLeft = 7 | 30;

export type NotifyCalendarRemindersInput = {
  now?: Date;
};

@Injectable()
export class NotifyCalendarRemindersUseCase {
  private readonly logger = new Logger(NotifyCalendarRemindersUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async execute(input: NotifyCalendarRemindersInput = {}): Promise<void> {
    try {
      const today = toParisDate(input.now);
      this.logger.log(`Checking calendar reminders for ${today.toISODate()} ...`);

      await this.notifyBirthdayReminders(today);
      await this.notifyChristmasReminders(today);
    } catch (e) {
      this.logger.error('Fail to send calendar reminders', e);
    }
  }

  private async notifyBirthdayReminders(today: DateTime) {
    for (const daysLeft of [30, 7] as const) {
      const target = today.plus({ days: daysLeft });
      const users = await this.userEmailSettingRepository.findUsersForBirthdayReminder({
        month: target.month,
        day: target.day,
      });

      this.logger.log(`Found ${users.length} birthday reminder(s) for J-${daysLeft}`, {
        month: target.month,
        day: target.day,
      });

      for (const user of users) {
        await this.sendReminder({ user, kind: 'birthday', daysLeft });
      }
    }
  }

  private async notifyChristmasReminders(today: DateTime) {
    const daysLeft = christmasDaysLeft(today);
    if (daysLeft === undefined) {
      return;
    }

    const users = await this.userEmailSettingRepository.findUsersForChristmasReminder();
    this.logger.log(`Found ${users.length} Christmas reminder(s) for J-${daysLeft}`);

    for (const user of users) {
      await this.sendReminder({ user, kind: 'christmas', daysLeft });
    }
  }

  private async sendReminder(params: { user: User; kind: CalendarReminderKind; daysLeft: CalendarReminderDaysLeft }) {
    try {
      const { user, kind, daysLeft } = params;
      const when = daysLeft === 7 ? 'dans 7 jours' : 'dans 30 jours';
      const subject = kind === 'christmas' ? `Noël est ${when}` : `Votre anniversaire est ${when}`;
      const actionUrl =
        kind === 'christmas' ? this.frontendRoutes.routes.event.list() : this.frontendRoutes.routes.wishlist.list();

      await this.mailService.sendMail({
        to: user.email,
        subject,
        template: MailTemplate.CALENDAR_REMINDER,
        context: {
          firstName: user.firstName,
          kind,
          daysLeft,
          actionUrl,
        },
      });
    } catch (e) {
      this.logger.error(`Fail to send ${params.kind} reminder to ${params.user.id}`, e);
    }
  }
}

export function toParisDate(now?: Date): DateTime {
  return now
    ? DateTime.fromJSDate(now, { zone: CALENDAR_REMINDER_TIMEZONE }).startOf('day')
    : DateTime.now().setZone(CALENDAR_REMINDER_TIMEZONE).startOf('day');
}

export function christmasDaysLeft(today: DateTime): CalendarReminderDaysLeft | undefined {
  if (today.month === 11 && today.day === 25) {
    return 30;
  }
  if (today.month === 12 && today.day === 18) {
    return 7;
  }
  return undefined;
}
