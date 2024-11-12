import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { BadRequestException, Injectable } from '@nestjs/common'
import { EventId, SecretSantaId, SecretSantaStatus, UserId } from '@wishlist/common-types'

import { BusService } from '../../../core/bus/bus.service'
import { MailService } from '../../../core/mail/mail.service'
import { toAttendeeDto } from '../../attendee/attendee.mapper'
import { SecretSantaEntity, SecretSantaUserEntity } from '../secret-santa.entity'
import { SecretSantaRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  secretSantaId: SecretSantaId
}

export type CancelSecretSantaHandlerDefinition = CommandHandlerDefinition<'cancelSecretSanta', Command, void>

@Injectable()
export class CancelSecretSantaUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly mailService: MailService,
  ) {
    busService.registerCommandHandler('cancelSecretSanta', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: message.secretSantaId,
      userId: message.userId,
    })

    if (secretSanta.isCreated()) {
      throw new BadRequestException('Secret santa not yet started')
    }

    await this.secretSantaRepository.transaction(async em => {
      await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.CREATED })
      await em.update(SecretSantaUserEntity, { secretSantaId: secretSanta.id }, { drawUserId: null })
    })

    const event = await secretSanta.event
    const users = await secretSanta.users
    const attendees = await Promise.all(users.map(u => u.attendee.then(toAttendeeDto)))

    await this.sendCancelSecretSantaEmails({
      eventTitle: event.title,
      eventId: event.id,
      attendeeEmails: attendees.map(a => a.pending_email ?? a.user?.email ?? ''),
    })
  }

  private async sendCancelSecretSantaEmails(params: {
    eventTitle: string
    eventId: EventId
    attendeeEmails: string[]
  }) {
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
