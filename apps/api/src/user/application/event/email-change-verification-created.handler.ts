import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { EmailChangeVerificationCreatedEvent } from '../../domain/event/email-change-verification-created.event';

export class EmailChangeVerificationCreatedHandler {
  private readonly logger = getLogger(EmailChangeVerificationCreatedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(params: EmailChangeVerificationCreatedEvent) {
    this.logger.info('Email change verification created event received, sending confirmation emails...', { params });

    const confirmationUrl = this.frontendRoutes.routes.user.confirmEmailChange({
      email: params.newEmail,
      token: params.token,
    });

    await Promise.all([
      this.mailService.sendMail({
        to: params.newEmail,
        subject: "Confirmez votre changement d'adresse email",
        template: MailTemplate.CONFIRM_EMAIL_CHANGE,
        context: {
          url: confirmationUrl,
          newEmail: params.newEmail,
        },
      }),
      this.mailService.sendMail({
        to: params.oldEmail,
        subject: "Demande de changement d'adresse email",
        template: MailTemplate.EMAIL_CHANGE_NOTIFICATION,
        context: {
          newEmail: params.newEmail,
        },
      }),
    ]);
  }
}
