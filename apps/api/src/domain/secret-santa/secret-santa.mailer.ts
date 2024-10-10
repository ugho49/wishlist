import { Injectable } from '@nestjs/common'
import { chunk as createChunks } from 'lodash'

import { MailService } from '../../core/mail/mail.service'

@Injectable()
export class SecretSantaMailer {
  constructor(private readonly mailService: MailService) {}

  async sendDrawnEmails(params: {
    eventTitle: string
    eventId: string
    drawns: Array<{
      email: string
      secretSantaName: string
    }>
  }) {
    const { eventTitle, eventId, drawns } = params
    const eventUrl = `https://wishlistapp.fr/events/${eventId}`

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
            },
          }),
        ),
      )
    }
  }
}
