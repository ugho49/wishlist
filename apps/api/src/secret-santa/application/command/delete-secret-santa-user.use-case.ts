import type { ICurrentUser, SecretSantaId, SecretSantaUserId } from '@wishlist/common'

import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaRepository, SecretSantaUserRepository } from '../../domain'

export type DeleteSecretSantaUserInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
  secretSantaUserId: SecretSantaUserId
}

@Injectable()
export class DeleteSecretSantaUserUseCase {
  private readonly logger = new Logger(DeleteSecretSantaUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaUserInput): Promise<void> {
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
