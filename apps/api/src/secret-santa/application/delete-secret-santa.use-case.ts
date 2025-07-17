import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../attendee/domain/attendee.repository'
import { Event } from '../../event/domain/event.model'
import { ATTENDEE_REPOSITORY, SECRET_SANTA_REPOSITORY } from '../../repositories/repositories.tokens'
import { DeleteSecretSantaCommand } from '../domain/command/delete-secret-santa.command'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(DeleteSecretSantaCommand)
export class DeleteSecretSantaUseCase implements IInferredCommandHandler<DeleteSecretSantaCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(command: DeleteSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const eventAttendees = await this.attendeeRepository.findByEventId(secretSanta.eventId)

    if (!Event.canEdit({ currentUser: command.currentUser, attendees: eventAttendees })) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started, it needs to be cancelled first')
    }

    await this.secretSantaRepository.delete(secretSanta.id)
  }
}
