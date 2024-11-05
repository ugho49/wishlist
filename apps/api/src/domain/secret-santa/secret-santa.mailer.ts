import { Injectable } from '@nestjs/common'
import { EventId } from '@wishlist/common-types'
import { chunk as createChunks } from 'lodash'

import { MailService } from '../../core/mail/mail.service'

@Injectable()
export class SecretSantaMailer {
  constructor(private readonly mailService: MailService) {}

  async sendDrawnEmails(params: {
    eventTitle: string
    eventId: EventId
    description?: string
    budget?: number
    drawns: Array<{
      email: string
      secretSantaName: string
    }>
  }) {
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

  async sendCancelSecretSantaEmails(params: { eventTitle: string; eventId: EventId; attendeeEmails: string[] }) {
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
