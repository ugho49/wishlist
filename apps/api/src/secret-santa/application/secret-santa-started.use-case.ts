import { Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { chunk as createChunks } from 'lodash'

import { appConfig } from '../../core'
import { MailService, MailTemplate } from '../../core/mail'
import { SecretSantaStartedEvent } from '../domain/event/secret-santa-started.event'

@EventsHandler(SecretSantaStartedEvent)
export class SecretSantaStartedUseCase implements IEventHandler<SecretSantaStartedEvent> {
  constructor(
    private readonly mailService: MailService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async handle(params: SecretSantaStartedEvent) {
    const { eventTitle, eventId, drawns, budget, description } = params
    const eventUrl = `${this.config.frontendBaseUrl}/events/${eventId}`
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
  }
}
