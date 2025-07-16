import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../attendee/domain/attendee.repository'
import { Event } from '../../event/domain/event.model'
import {
  ATTENDEE_REPOSITORY,
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
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(command: DeleteSecretSantaUserCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const eventAttendees = await this.attendeeRepository.findByEventId(secretSanta.eventId)

    if (!Event.canEdit({ currentUser: command.currentUser, attendees: eventAttendees })) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaUserRepository.delete(command.secretSantaUserId)
  }
}
