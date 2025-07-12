import type { SecretSantaDto } from '@wishlist/common'

import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { EventRepository } from '../../../event/domain/event.repository'
import { EVENT_REPOSITORY, SECRET_SANTA_REPOSITORY } from '../../../repositories'
import { CreateSecretSantaCommand } from '../../domain/command/create-secret-santa.command'
import { SecretSantaModel } from '../../domain/model/secret-santa.model'
import { SecretSantaRepository } from '../../domain/repository/secret-santa.repository'
import { toSecretSantaDto } from '../../infrastructure/secret-santa.mapper'

@CommandHandler(CreateSecretSantaCommand)
export class CreateSecretSantaHandler implements IInferredCommandHandler<CreateSecretSantaCommand> {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaCommand): Promise<SecretSantaDto> {
    const alreadyExists = await this.secretSantaRepository.existsForEvent(command.eventId)

    if (alreadyExists) {
      throw new BadRequestException('Secret santa already exists for event')
    }

    const event = await this.eventRepository.findByIdForUser(command.eventId, command.userId)

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const secretSanta = SecretSantaModel.create({
      eventId: event.id,
      budget: command.budget,
      description: command.description,
    })

    await this.secretSantaRepository.save(secretSanta)

    return toSecretSantaDto(secretSanta)
  }
}
