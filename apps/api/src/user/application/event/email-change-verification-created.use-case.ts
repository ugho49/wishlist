import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'

import { EmailChangeVerificationCreatedEvent } from '../../domain'

@EventsHandler(EmailChangeVerificationCreatedEvent)
export class EmailChangeVerificationCreatedUseCase implements IEventHandler<EmailChangeVerificationCreatedEvent> {
  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: EmailChangeVerificationCreatedEvent) {
    const confirmationUrl = this.frontendRoutes.routes.user.confirmEmailChange({
      email: params.newEmail,
      token: params.token,
    })

    // Send confirmation email to the new email address
    await this.mailService.sendMail({
      to: params.newEmail,
      subject: '[Wishlist] Confirmez votre changement d\'adresse email',
      template: MailTemplate.CONFIRM_EMAIL_CHANGE,
      context: {
        url: confirmationUrl,
        newEmail: params.newEmail,
      },
    })

    // Send notification email to the old email address
    await this.mailService.sendMail({
      to: params.oldEmail,
      subject: '[Wishlist] Demande de changement d\'adresse email',
      template: MailTemplate.EMAIL_CHANGE_NOTIFICATION,
      context: {
        newEmail: params.newEmail,
      },
    })
  }
}
