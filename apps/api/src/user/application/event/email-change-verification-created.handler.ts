import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'

import { EmailChangeVerificationCreatedEvent } from '../../domain'

@EventsHandler(EmailChangeVerificationCreatedEvent)
export class EmailChangeVerificationCreatedHandler implements IEventHandler<EmailChangeVerificationCreatedEvent> {
  private readonly logger = new Logger(EmailChangeVerificationCreatedHandler.name)

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: EmailChangeVerificationCreatedEvent) {
    this.logger.log('Email change verification created event received, sending confirmation emails...', { params })

    const confirmationUrl = this.frontendRoutes.routes.user.confirmEmailChange({
      email: params.newEmail,
      token: params.token,
    })

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
    ])
  }
}
