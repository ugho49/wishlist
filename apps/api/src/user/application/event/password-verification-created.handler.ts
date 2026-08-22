import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { PasswordVerificationCreatedEvent } from '../../domain/event/password-verification-created.event';

@EventsHandler(PasswordVerificationCreatedEvent)
export class PasswordVerificationCreatedHandler implements IEventHandler<PasswordVerificationCreatedEvent> {
  private readonly logger = new Logger(PasswordVerificationCreatedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: PasswordVerificationCreatedEvent) {
    this.logger.log('Password verification created event received, sending reset password email...', { params });

    await this.mailService.sendMail({
      to: params.email,
      subject: '[Wishlist] Reinitialiser le mot de passe',
      template: MailTemplate.RESET_PASSWORD,
      context: {
        url: this.frontendRoutes.routes.user.resetPassword({ email: params.email, token: params.token }),
      },
    });
  }
}
