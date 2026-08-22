import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { EmailChangeVerificationCreatedEvent } from '../../domain/event/email-change-verification-created.event';

@EventsHandler(EmailChangeVerificationCreatedEvent)
export class EmailChangeVerificationCreatedHandler implements IEventHandler<EmailChangeVerificationCreatedEvent> {
  private readonly logger = new Logger(EmailChangeVerificationCreatedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: EmailChangeVerificationCreatedEvent) {
    this.logger.log('Email change verification created event received, sending confirmation emails...', { params });

    const confirmationUrl = this.frontendRoutes.routes.user.confirmEmailChange({
      email: params.newEmail,
      token: params.token,
    });

    await Promise.all([
      this.mailService.sendMail({
        to: params.newEmail,
        subject: "[Wishlist] Confirmez votre changement d'adresse email",
        template: MailTemplate.CONFIRM_EMAIL_CHANGE,
        context: {
          url: confirmationUrl,
          newEmail: params.newEmail,
        },
      }),
      this.mailService.sendMail({
        to: params.oldEmail,
        subject: "[Wishlist] Demande de changement d'adresse email",
        template: MailTemplate.EMAIL_CHANGE_NOTIFICATION,
        context: {
          newEmail: params.newEmail,
        },
      }),
    ]);
  }
}
