import { EventsHandler, IEventHandler } from '@nestjs/cqrs'

import { MailService } from '../../../../core/mail/mail.service'
import { SecretSantaCancelledEvent } from '../event/secret-santa-cancelled.event'

@EventsHandler(SecretSantaCancelledEvent)
export class SecretSantaCancelledHandler implements IEventHandler<SecretSantaCancelledEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(params: SecretSantaCancelledEvent) {
    const { eventTitle, eventId, attendeeEmails } = params
    const eventUrl = `https://wishlistapp.fr/events/${eventId}`

    await this.mailService.sendMail({
      to: attendeeEmails,
      subject: "[Wishlist] Le secret santa viens d'être annulé",
      template: 'secret-santa-cancel',
      context: {
        eventTitle,
        eventUrl,
      },
    })
  }
}
