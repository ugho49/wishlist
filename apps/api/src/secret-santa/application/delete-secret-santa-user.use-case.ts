import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'

import {
  EVENT_REPOSITORY,
  SECRET_SANTA_REPOSITORY,
  SECRET_SANTA_USER_REPOSITORY,
} from '../../repositories/repositories.tokens'
import { DeleteSecretSantaUserCommand } from '../domain/command/delete-secret-santa-user.command'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(DeleteSecretSantaUserCommand)
export class DeleteSecretSantaUserUseCase implements IInferredCommandHandler<DeleteSecretSantaUserCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaUserCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaUserRepository.delete(command.secretSantaUserId)
  }
}
