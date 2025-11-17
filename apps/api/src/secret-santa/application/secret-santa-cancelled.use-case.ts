import { Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'

import { appConfig } from '../../core'
import { MailService } from '../../core/mail/mail.service'
import { SecretSantaCancelledEvent } from '../domain/event/secret-santa-cancelled.event'

@EventsHandler(SecretSantaCancelledEvent)
export class SecretSantaCancelledUseCase implements IEventHandler<SecretSantaCancelledEvent> {
  constructor(
    private readonly mailService: MailService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async handle(params: SecretSantaCancelledEvent) {
    const { eventTitle, eventId, attendeeEmails } = params
    const eventUrl = `${this.config.frontendBaseUrl}/events/${eventId}`

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
