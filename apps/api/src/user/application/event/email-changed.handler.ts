import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { EmailChangedEvent } from '../../domain/event/email-changed.event';

export class EmailChangedhandler {
  private readonly logger = getLogger(EmailChangedhandler.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent({ detached: true })
  async handle(params: EmailChangedEvent) {
    this.logger.info('Email changed event received, sending confirmation emails...', { params });

    await Promise.all([
      // Send confirmation email to the old email address
      this.mailService.sendMail({
        to: params.oldEmail,
        subject: 'Votre adresse email a été modifiée',
        template: MailTemplate.EMAIL_CHANGED_CONFIRMATION,
        context: {
          newEmail: params.newEmail,
        },
      }),
      // Send confirmation email to the new email address
      this.mailService.sendMail({
        to: params.newEmail,
        subject: 'Votre adresse email a été mise à jour',
        template: MailTemplate.EMAIL_CHANGED_SUCCESS,
        context: {
          email: params.newEmail,
        },
      }),
    ]);
  }
}
