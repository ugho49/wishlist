import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { PasswordResetRequestedEvent } from '../../domain/event/password-reset-requested.event';

export class PasswordResetRequestedHandler {
  private readonly logger = getLogger(PasswordResetRequestedHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(params: PasswordResetRequestedEvent) {
    this.logger.info('Password reset requested, sending the reset password email...', { params });

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
