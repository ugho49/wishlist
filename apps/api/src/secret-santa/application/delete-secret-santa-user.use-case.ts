import { ForbiddenException, Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'

import { REPOSITORIES } from '../../repositories/repositories.constants'
import { DeleteSecretSantaUserCommand } from '../domain/command/delete-secret-santa-user.command'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'

@CommandHandler(DeleteSecretSantaUserCommand)
export class DeleteSecretSantaUserUseCase implements IInferredCommandHandler<DeleteSecretSantaUserCommand> {
  private readonly logger = new Logger(DeleteSecretSantaUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaUserCommand): Promise<void> {
    this.logger.log('Delete secret santa user request received', { command })
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    this.logger.log('Deleting secret santa user...', {
      secretSantaId: secretSanta.id,
      secretSantaUserId: command.secretSantaUserId,
    })
    await this.secretSantaUserRepository.delete(command.secretSantaUserId)
  }
}
