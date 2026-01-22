import type { ICurrentUser, SecretSantaId } from '@wishlist/common'

import { ConflictException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaRepository } from '../../domain'

export type UpdateSecretSantaInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
  description?: string
  budget?: number
}

@Injectable()
export class UpdateSecretSantaUseCase {
  private readonly logger = new Logger(UpdateSecretSantaUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaInput): Promise<void> {
    this.logger.log('Update secret santa request received', { command })
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

    this.logger.log('Saving secret santa...', { secretSantaId: secretSanta.id, updatedSecretSanta })
    await this.secretSantaRepository.save(updatedSecretSanta)
  }
}
