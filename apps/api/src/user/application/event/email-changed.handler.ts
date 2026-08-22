import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { EmailChangedEvent } from '../../domain/event/email-changed.event';

@EventsHandler(EmailChangedEvent)
export class EmailChangedhandler implements IEventHandler<EmailChangedEvent> {
  private readonly logger = new Logger(EmailChangedhandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(params: EmailChangedEvent) {
    this.logger.log('Email changed event received, sending confirmation emails...', { params });

    await Promise.all([
      // Send confirmation email to the old email address
      this.mailService.sendMail({
        to: params.oldEmail,
        subject: '[Wishlist] Votre adresse email a été modifiée',
        template: MailTemplate.EMAIL_CHANGED_CONFIRMATION,
        context: {
          newEmail: params.newEmail,
        },
      }),
      // Send confirmation email to the new email address
      this.mailService.sendMail({
        to: params.newEmail,
        subject: '[Wishlist] Votre adresse email a été mise à jour',
        template: MailTemplate.EMAIL_CHANGED_SUCCESS,
        context: {
          email: params.newEmail,
        },
      }),
    ]);
  }
}
