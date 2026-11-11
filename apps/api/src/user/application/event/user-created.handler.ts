import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { type EventAttendeeRepository } from '../../../event/domain/repository/event-attendee.repository';
import { UserCreatedEvent } from '../../domain/event/user-created.event';
import { UserEmailSetting } from '../../domain/model/user-email-setting.model';

export class UserCreatedHandler {
  private readonly logger = getLogger(UserCreatedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
    private readonly eventAttendeeRepository: EventAttendeeRepository,
    private readonly transactionManager: TransactionManager,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(params: UserCreatedEvent) {
    this.logger.info('User created event received', { userId: params.user.id });
    const settings = UserEmailSetting.create({ id: this.userEmailSettingRepository.newId(), user: params.user });

    this.logger.info('Creating event attendees from temporary attendees for this user email...', {
      userId: params.user.id,
    });
    const eventAttendeeByUserEmail = await this.eventAttendeeRepository
      .findByTempEmail(params.user.email)
      .then(attendees => attendees.map(attendee => attendee.convertTemporaryAttendeeToUser(params.user)));

    await this.transactionManager.runInTransaction(async tx => {
      await this.userEmailSettingRepository.save(settings, tx);

      for (const attendee of eventAttendeeByUserEmail) {
        await this.eventAttendeeRepository.save(attendee, tx);
      }
    });

    try {
      this.logger.info('Sending welcome email to user...', { userId: params.user.id });
      await this.mailService.sendMail({
        to: params.user.email,
        subject: 'Bienvenue !!!',
        template: MailTemplate.WELCOME_USER,
        context: {
          mainUrl: this.frontendRoutes.routes.home(),
        },
      });
    } catch (error) {
      this.logger.error('Fail to send welcome mail to user', { error: error });
    }
  }
}
