import type { SecretSantaDto } from '@wishlist/common'

import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { EventRepository } from '../../../event/event.repository'
import { SecretSantaEntity } from '../../infrastructure/secret-santa.entity'
import { toSecretSantaDto } from '../../infrastructure/secret-santa.mapper'
import { SecretSantaRepository } from '../../infrastructure/secret-santa.repository'
import { CreateSecretSantaCommand } from '../command/create-secret-santa.command'

@CommandHandler(CreateSecretSantaCommand)
export class CreateSecretSantaHandler implements IInferredCommandHandler<CreateSecretSantaCommand> {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaCommand): Promise<SecretSantaDto> {
    const alreadyExists = await this.secretSantaRepository.exists({ where: { eventId: command.eventId } })

    if (alreadyExists) {
      throw new BadRequestException('Secret santa already exists for event')
    }

    const event = await this.eventRepository.findByIdAndUserId({
      eventId: command.eventId,
      userId: command.userId,
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const entity = SecretSantaEntity.create({
      eventId: event.id,
      budget: command.budget,
      description: command.description,
    })

    await this.secretSantaRepository.save(entity)

    return toSecretSantaDto(entity)
  }
}
