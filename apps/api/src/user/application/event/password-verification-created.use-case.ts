import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'

import { PasswordVerificationCreatedEvent } from '../../domain'

@EventsHandler(PasswordVerificationCreatedEvent)
export class PasswordVerificationCreatedUseCase implements IEventHandler<PasswordVerificationCreatedEvent> {
  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: PasswordVerificationCreatedEvent) {
    await this.mailService.sendMail({
      to: params.email,
      subject: '[Wishlist] Reinitialiser le mot de passe',
      template: MailTemplate.RESET_PASSWORD,
      context: {
        url: this.frontendRoutes.routes.user.resetPassword({ email: params.email, token: params.token }),
      },
    })
  }
}
