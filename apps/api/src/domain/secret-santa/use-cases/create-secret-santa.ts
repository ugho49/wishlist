import type { EventId, SecretSantaDto, UserId } from '@wishlist/common-types'
import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { BusService } from '../../../core/bus/bus.service'
import { EventRepository } from '../../event/event.repository'
import { SecretSantaEntity } from '../secret-santa.entity'
import { toSecretSantaDto } from '../secret-santa.mapper'
import { SecretSantaRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  eventId: EventId
  description?: string
  budget?: number
}
type Result = SecretSantaDto

export type CreateSecretSantaHandlerDefinition = CommandHandlerDefinition<'createSecretSanta', Command, Result>

@Injectable()
export class CreateSecretSantaUseCase {
  constructor(
    busService: BusService,
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
  ) {
    busService.registerCommandHandler('createSecretSanta', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<Result> {
    const alreadyExists = await this.secretSantaRepository.exists({ where: { eventId: message.eventId } })

    if (alreadyExists) {
      throw new BadRequestException('Secret santa already exists for event')
    }

    const event = await this.eventRepository.findByIdAndUserId({
      eventId: message.eventId,
      userId: message.userId,
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const entity = SecretSantaEntity.create({
      eventId: event.id,
      budget: message.budget,
      description: message.description,
    })

    await this.secretSantaRepository.save(entity)

    return toSecretSantaDto(entity)
  }
}
