import { BadRequestException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { AddSecretSantaUserCommand, AddSecretSantaUserResult } from '../domain/command/add-secret-santa-user.command'
import { SecretSantaUser } from '../domain/model/secret-santa-user.model'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'
import { secretSantaMapper } from '../infrastructure/secret-santa.mapper'

@CommandHandler(AddSecretSantaUserCommand)
export class AddSecretSantaUserUseCase implements IInferredCommandHandler<AddSecretSantaUserCommand> {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: AddSecretSantaUserCommand): Promise<AddSecretSantaUserResult> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started')
    }

    if (!secretSanta.canAddUsers(command.attendeeIds)) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    for (const attendeeId of command.attendeeIds) {
      if (!event.attendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const users = command.attendeeIds.map(attendeeId =>
      SecretSantaUser.create({
        id: this.secretSantaUserRepository.newId(),
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    )

    await this.secretSantaUserRepository.saveAll(users)

    const userDtos = users.map(user =>
      secretSantaMapper.toSecretSantaUserDto(user, event.attendees.find(a => a.id === user.attendeeId)!),
    )

    return { users: userDtos }
  }
}
