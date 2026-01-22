import type { ICurrentUser, SecretSantaId, SecretSantaUserId } from '@wishlist/common'

import { BadRequestException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaRepository, SecretSantaUserRepository } from '../../domain'

export type UpdateSecretSantaUserInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
  secretSantaUserId: SecretSantaUserId
  exclusions: SecretSantaUserId[]
}

@Injectable()
export class UpdateSecretSantaUserUseCase {
  private readonly logger = new Logger(UpdateSecretSantaUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaUserInput): Promise<void> {
    this.logger.log('Update secret santa user request received', { command })
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started')
    }

    if (command.exclusions.includes(command.secretSantaUserId)) {
      throw new BadRequestException('Secret santa user cannot exclude himself')
    }

    const updatedSecretSanta = secretSanta.updateUserExclusions(command.secretSantaUserId, command.exclusions)
    this.logger.log('Saving secret santa users...', { secretSantaId: secretSanta.id, updatedSecretSanta })
    await this.secretSantaUserRepository.saveAll(updatedSecretSanta)
  }
}
