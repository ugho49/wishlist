import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { PasswordVerificationCreatedEvent } from '../../domain/event/password-verification-created.event';

export class PasswordVerificationCreatedHandler {
  private readonly logger = getLogger(PasswordVerificationCreatedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(params: PasswordVerificationCreatedEvent) {
    this.logger.info('Password verification created event received, sending reset password email...', { params });

    await this.mailService.sendMail({
      to: params.email,
      subject: 'Reinitialiser le mot de passe',
      template: MailTemplate.RESET_PASSWORD,
      context: {
        url: this.frontendRoutes.routes.user.resetPassword({ email: params.email, token: params.token }),
      },
    });
  }
}
