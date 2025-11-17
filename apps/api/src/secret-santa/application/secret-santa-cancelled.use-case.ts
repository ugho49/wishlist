import { EventsHandler, IEventHandler } from '@nestjs/cqrs'

import { FrontendRoutesService } from '../../core'
import { MailService, MailTemplate } from '../../core/mail'
import { SecretSantaCancelledEvent } from '../domain/event/secret-santa-cancelled.event'

@EventsHandler(SecretSantaCancelledEvent)
export class SecretSantaCancelledUseCase implements IEventHandler<SecretSantaCancelledEvent> {
  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: SecretSantaCancelledEvent) {
    const { eventTitle, eventId, attendeeEmails } = params

    await this.mailService.sendMail({
      to: attendeeEmails,
      subject: "[Wishlist] Le secret santa viens d'être annulé",
      template: MailTemplate.SECRET_SANTA_CANCEL,
      context: {
        eventTitle,
        eventUrl: this.frontendRoutes.routes.event.byId(eventId),
      },
    })
  }
}
