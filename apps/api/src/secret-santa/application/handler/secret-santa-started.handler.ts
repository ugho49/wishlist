import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { chunk as createChunks } from 'lodash'

import { MailService } from '../../../core/mail/mail.service'
import { SecretSantaStartedEvent } from '../../domain/event/secret-santa-started.event'

@EventsHandler(SecretSantaStartedEvent)
export class SecretSantaStartedHandler implements IEventHandler<SecretSantaStartedEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(params: SecretSantaStartedEvent) {
    const { eventTitle, eventId, drawns, budget, description } = params
    const eventUrl = `https://wishlistapp.fr/events/${eventId}`
    const eurosFormatter = Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
    const budgetFormatted = budget ? eurosFormatter.format(budget) : 'non défini'
    const descriptionFormatted = description || 'non définie'

    const chunks = createChunks(drawns, 10)

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(({ email, secretSantaName }) =>
          this.mailService.sendMail({
            to: email,
            subject: '[Wishlist] Votre tirage au sort secret santa',
            template: 'secret-santa-draw',
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
  }
}
