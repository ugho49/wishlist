import type { SecretSantaDto } from '@wishlist/common'

import { ConflictException, ForbiddenException, Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { CreateSecretSantaCommand, SecretSanta, SecretSantaRepository } from '../domain'
import { secretSantaMapper } from '../infrastructure'

@CommandHandler(CreateSecretSantaCommand)
export class CreateSecretSantaUseCase implements IInferredCommandHandler<CreateSecretSantaCommand> {
  private readonly logger = new Logger(CreateSecretSantaUseCase.name)

  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaCommand): Promise<SecretSantaDto> {
    this.logger.log('Create secret santa request received', { command })
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

    this.logger.log('Saving secret santa...', { secretSantaId: secretSanta.id, secretSanta })
    await this.secretSantaRepository.save(secretSanta)

    return secretSantaMapper.toSecretSantaDto(secretSanta, event)
  }
}
