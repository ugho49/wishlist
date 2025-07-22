import { ConflictException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'

import { REPOSITORIES } from '../../repositories'
import { UpdateSecretSantaCommand } from '../domain/command/update-secret-santa.command'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(UpdateSecretSantaCommand)
export class UpdateSecretSantaUseCase implements IInferredCommandHandler<UpdateSecretSantaCommand> {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (!secretSanta.canBeModified()) {
      throw new ConflictException('Secret santa already started')
    }

    const updatedSecretSanta = secretSanta.update({
      description: command.description,
      budget: command.budget,
    })

    await this.secretSantaRepository.save(updatedSecretSanta)
  }
}
