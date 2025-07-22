import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'

import { REPOSITORIES } from '../../repositories/repositories.constants'
import { DeleteSecretSantaCommand } from '../domain/command/delete-secret-santa.command'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(DeleteSecretSantaCommand)
export class DeleteSecretSantaUseCase implements IInferredCommandHandler<DeleteSecretSantaCommand> {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started, it needs to be cancelled first')
    }

    await this.secretSantaRepository.delete(secretSanta.id)
  }
}
