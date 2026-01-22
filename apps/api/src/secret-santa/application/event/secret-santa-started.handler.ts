import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { chunk as createChunks } from 'lodash'

import { FrontendRoutesService } from '../../../core'
import { MailService, MailTemplate } from '../../../core/mail'
import { SecretSantaStartedEvent } from '../../domain/event/secret-santa-started.event'

@EventsHandler(SecretSantaStartedEvent)
export class SecretSantaStartedHandler implements IEventHandler<SecretSantaStartedEvent> {
  private readonly logger = new Logger(SecretSantaStartedHandler.name)

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: SecretSantaStartedEvent) {
    this.logger.log('Secret santa started event received', { params })
    const { eventTitle, eventId, drawns, budget, description } = params
    const eventUrl = this.frontendRoutes.routes.event.byId(eventId)
    const eurosFormatter = Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
    const budgetFormatted = budget ? eurosFormatter.format(budget) : 'non défini'
    const descriptionFormatted = description || 'non définie'

    const chunks = createChunks(drawns, 10)

    this.logger.log('Sending emails to attendees...', { eventTitle, eventId, drawns })
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(({ email, secretSantaName }) =>
          this.mailService.sendMail({
            to: email,
            subject: '[Wishlist] Votre tirage au sort secret santa',
            template: MailTemplate.SECRET_SANTA_DRAW,
            context: {
              eventTitle,
              eventUrl,
              secretSantaName,
              budget: budgetFormatted,
              description: descriptionFormatted,
            },
          }),
        ),
      )
    }
    this.logger.log('Emails sent to attendees', { eventTitle, eventId, drawns })
  }
}
