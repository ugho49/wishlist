import { BadRequestException, ForbiddenException, Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'

import { REPOSITORIES } from '../../repositories'
import { UpdateSecretSantaUserCommand } from '../domain/command/update-secret-santa-user.command'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'

@CommandHandler(UpdateSecretSantaUserCommand)
export class UpdateSecretSantaUserUseCase implements IInferredCommandHandler<UpdateSecretSantaUserCommand> {
  private readonly logger = new Logger(UpdateSecretSantaUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaUserCommand): Promise<void> {
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
