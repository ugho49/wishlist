import { BadRequestException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { AttendeeRepository } from '@wishlist/api/attendee'
import { Event } from '@wishlist/api/event'
import { ATTENDEE_REPOSITORY, SECRET_SANTA_REPOSITORY, SECRET_SANTA_USER_REPOSITORY } from '@wishlist/api/repositories'

import { AddSecretSantaUserCommand, AddSecretSantaUserResult } from '../domain/command/add-secret-santa-user.command'
import { SecretSantaUser } from '../domain/model/secret-santa-user.model'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'
import { secretSantaMapper } from '../infrastructure/secret-santa.mapper'

@CommandHandler(AddSecretSantaUserCommand)
export class AddSecretSantaUserUseCase implements IInferredCommandHandler<AddSecretSantaUserCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(command: AddSecretSantaUserCommand): Promise<AddSecretSantaUserResult> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const eventAttendees = await this.attendeeRepository.findByEventId(secretSanta.eventId)

    if (!Event.canEdit({ currentUser: command.currentUser, attendees: eventAttendees })) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started')
    }

    if (!secretSanta.canAddUsers(command.attendeeIds)) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    for (const attendeeId of command.attendeeIds) {
      if (!eventAttendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const users = command.attendeeIds.map(attendeeId =>
      SecretSantaUser.create({
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    )

    await this.secretSantaUserRepository.saveAll(users)

    const userDtos = users.map(user =>
      secretSantaMapper.toSecretSantaUserDto(user, eventAttendees.find(a => a.id === user.attendeeId)!),
    )

    return { users: userDtos }
  }
}
