import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'

import { PasswordVerificationCreatedEvent } from '../../domain'

@EventsHandler(PasswordVerificationCreatedEvent)
export class PasswordVerificationCreatedUseCase implements IEventHandler<PasswordVerificationCreatedEvent> {
  private readonly logger = new Logger(PasswordVerificationCreatedUseCase.name)

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: PasswordVerificationCreatedEvent) {
    this.logger.log('Password verification created event received, sending reset password email...', { params })

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
