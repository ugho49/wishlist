import type { SecretSantaDto } from '@wishlist/common'

import { ConflictException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { CreateSecretSantaCommand, SecretSanta, SecretSantaRepository } from '../domain'
import { secretSantaMapper } from '../infrastructure'

@CommandHandler(CreateSecretSantaCommand)
export class CreateSecretSantaUseCase implements IInferredCommandHandler<CreateSecretSantaCommand> {
  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaCommand): Promise<SecretSantaDto> {
    const alreadyExists = await this.secretSantaRepository.existsForEvent(command.eventId)

    if (alreadyExists) {
      throw new ConflictException('Secret santa already exists for event')
    }

    const event = await this.eventRepository.findByIdOrFail(command.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    const secretSanta = SecretSanta.create({
      id: this.secretSantaRepository.newId(),
      eventId: command.eventId,
      budget: command.budget,
      description: command.description,
    })

    await this.secretSantaRepository.save(secretSanta)

    return secretSantaMapper.toSecretSantaDto(secretSanta, event)
  }
}
