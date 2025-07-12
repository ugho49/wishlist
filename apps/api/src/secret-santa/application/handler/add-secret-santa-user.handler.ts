import { BadRequestException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../../attendee/domain/attendee.repository'
import { ATTENDEE_REPOSITORY, SECRET_SANTA_REPOSITORY, SECRET_SANTA_USER_REPOSITORY } from '../../../repositories'
import { AddSecretSantaUserCommand, AddSecretSantaUserResult } from '../../domain/command/add-secret-santa-user.command'
import { SecretSantaUserModel } from '../../domain/model/secret-santa-user.model'
import { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../../domain/repository/secret-santa.repository'
import { toSecretSantaUserDto } from '../../infrastructure/secret-santa.mapper'

@CommandHandler(AddSecretSantaUserCommand)
export class AddSecretSantaUserHandler implements IInferredCommandHandler<AddSecretSantaUserCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(command: AddSecretSantaUserCommand): Promise<AddSecretSantaUserResult> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started')
    }

    if (!secretSanta.canAddUsers(command.attendeeIds)) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    const eventAttendees = await this.attendeeRepository.findByEventId(secretSanta.eventId)

    for (const attendeeId of command.attendeeIds) {
      if (!eventAttendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const users = command.attendeeIds.map(attendeeId =>
      SecretSantaUserModel.create({
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    )

    await this.secretSantaUserRepository.save(users)

    const userDtos = users.map(user => toSecretSantaUserDto(user))

    return { users: userDtos }
  }
}
