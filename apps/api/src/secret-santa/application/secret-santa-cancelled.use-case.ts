import { EventsHandler, IEventHandler } from '@nestjs/cqrs'

import { MailService, MailTemplate } from '../../core/mail'
import { SecretSantaCancelledEvent } from '../domain/event/secret-santa-cancelled.event'

@EventsHandler(SecretSantaCancelledEvent)
export class SecretSantaCancelledUseCase implements IEventHandler<SecretSantaCancelledEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(params: SecretSantaCancelledEvent) {
    const { eventTitle, eventId, attendeeEmails } = params
    const eventUrl = `https://wishlistapp.fr/events/${eventId}`

    await this.mailService.sendMail({
      to: attendeeEmails,
      subject: "[Wishlist] Le secret santa viens d'être annulé",
      template: MailTemplate.SECRET_SANTA_CANCEL,
      context: {
        eventTitle,
        eventUrl,
      },
    })
  }
}
