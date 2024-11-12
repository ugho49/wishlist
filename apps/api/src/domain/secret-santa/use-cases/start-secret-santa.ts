import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { BadRequestException, ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { SecretSantaDrawService } from '@wishlist/common'
import { EventId, SecretSantaId, SecretSantaStatus, UserId } from '@wishlist/common-types'
import { chunk as createChunks } from 'lodash'

import { BusService } from '../../../core/bus/bus.service'
import { MailService } from '../../../core/mail/mail.service'
import { SecretSantaEntity, SecretSantaUserEntity } from '../secret-santa.entity'
import { toSecretSantaUserWithDrawDto } from '../secret-santa.mapper'
import { SecretSantaRepository, SecretSantaUserRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  secretSantaId: SecretSantaId
}

export type StartSecretSantaHandlerDefinition = CommandHandlerDefinition<'startSecretSanta', Command, void>

@Injectable()
export class StartSecretSantaUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly mailService: MailService,
  ) {
    busService.registerCommandHandler('startSecretSanta', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: message.secretSantaId,
      userId: message.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    const event = await secretSanta.event

    if (event.eventDate < new Date()) {
      throw new BadRequestException('Event is already finished')
    }

    let secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id })

    try {
      const drawService = new SecretSantaDrawService(
        secretSantaUsers.map(ss => ({ id: ss.id, exclusions: ss.exclusions })),
      )
      const assignedUsers = drawService.assignSecretSantas()

      await this.secretSantaRepository.transaction(async em => {
        for (const user of assignedUsers) {
          await em.update(SecretSantaUserEntity, { id: user.userId }, { drawUserId: user.drawUserId })
        }

        await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.STARTED })
      })
    } catch {
      throw new UnprocessableEntityException('Failed to draw secret santa, please try again')
    }

    secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id })
    const secretSantaDto = await Promise.all(secretSantaUsers.map(ss => toSecretSantaUserWithDrawDto(ss)))

    await this.sendDrawnEmails({
      eventTitle: event.title,
      eventId: event.id,
      budget: secretSanta.budget ?? undefined,
      description: secretSanta.description ?? undefined,
      drawns: secretSantaDto.map(ss => ({
        email: ss.attendee.pending_email ?? ss.attendee.user?.email ?? '',
        secretSantaName: ss.draw?.pending_email ?? `${ss.draw?.user?.firstname} ${ss.draw?.user?.lastname}`,
      })),
    })
  }

  private async sendDrawnEmails(params: {
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
}
