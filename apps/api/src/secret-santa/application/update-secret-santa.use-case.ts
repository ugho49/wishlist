import { ConflictException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../attendee/domain/attendee.repository'
import { Event } from '../../event/domain/event.model'
import { ATTENDEE_REPOSITORY, SECRET_SANTA_REPOSITORY } from '../../repositories'
import { UpdateSecretSantaCommand } from '../domain/command/update-secret-santa.command'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(UpdateSecretSantaCommand)
export class UpdateSecretSantaUseCase implements IInferredCommandHandler<UpdateSecretSantaCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(command: UpdateSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const attendees = await this.attendeeRepository.findByEventId(secretSanta.eventId)

    if (!Event.canEdit({ currentUser: command.currentUser, attendees })) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (!secretSanta.canBeModified()) {
      throw new ConflictException('Secret santa already started')
    }

    const updatedSecretSanta = secretSanta.update({
      description: command.description,
      budget: command.budget,
    })

    await this.secretSantaRepository.save(updatedSecretSanta)
  }
}
