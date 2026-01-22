import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'

import { FrontendRoutesService } from '../../../core'
import { MailService, MailTemplate } from '../../../core/mail'
import { SecretSantaCancelledEvent } from '../../domain/event/secret-santa-cancelled.event'

@EventsHandler(SecretSantaCancelledEvent)
export class SecretSantaCancelledHandler implements IEventHandler<SecretSantaCancelledEvent> {
  private readonly logger = new Logger(SecretSantaCancelledHandler.name)

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: SecretSantaCancelledEvent) {
    this.logger.log('Secret santa cancelled event received', { params })
    const { eventTitle, eventId, attendeeEmails } = params

    this.logger.log('Sending email to attendees', { eventTitle, eventId, attendeeEmails })
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
