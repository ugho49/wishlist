import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { MailService, MailTemplate } from '@wishlist/api/core'

import { EmailChangedEvent } from '../../domain'

@EventsHandler(EmailChangedEvent)
export class EmailChangedUseCase implements IEventHandler<EmailChangedEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(params: EmailChangedEvent) {
    // Send confirmation email to the old email address
    await this.mailService.sendMail({
      to: params.oldEmail,
      subject: '[Wishlist] Votre adresse email a été modifiée',
      template: MailTemplate.EMAIL_CHANGED_CONFIRMATION,
      context: {
        newEmail: params.newEmail,
      },
    })

    // Send welcome email to the new email address
    await this.mailService.sendMail({
      to: params.newEmail,
      subject: '[Wishlist] Votre adresse email a été mise à jour',
      template: MailTemplate.EMAIL_CHANGED_SUCCESS,
      context: {
        email: params.newEmail,
      },
    })
  }
}
