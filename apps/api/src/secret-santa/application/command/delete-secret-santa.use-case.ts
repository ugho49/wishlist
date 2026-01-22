import type { ICurrentUser, SecretSantaId } from '@wishlist/common'

import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaRepository } from '../../domain'

export type DeleteSecretSantaInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
}

@Injectable()
export class DeleteSecretSantaUseCase {
  private readonly logger = new Logger(DeleteSecretSantaUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: DeleteSecretSantaInput): Promise<void> {
    this.logger.log('Delete secret santa request received', { command })
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started, it needs to be cancelled first')
    }

    this.logger.log('Deleting secret santa...', { secretSantaId: secretSanta.id })
    await this.secretSantaRepository.delete(secretSanta.id)
  }
}
