import { BadRequestException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'

import { EVENT_REPOSITORY, SECRET_SANTA_REPOSITORY, SECRET_SANTA_USER_REPOSITORY } from '../../repositories'
import { UpdateSecretSantaUserCommand } from '../domain/command/update-secret-santa-user.command'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(UpdateSecretSantaUserCommand)
export class UpdateSecretSantaUserUseCase implements IInferredCommandHandler<UpdateSecretSantaUserCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateSecretSantaUserCommand): Promise<void> {
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
    await this.secretSantaUserRepository.saveAll(updatedSecretSanta)
  }
}
