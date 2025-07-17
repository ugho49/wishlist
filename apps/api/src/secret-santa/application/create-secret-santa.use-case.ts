import type { SecretSantaDto } from '@wishlist/common'

import { ConflictException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../attendee/domain/attendee.repository'
import { Event } from '../../event/domain/event.model'
import { EventRepository } from '../../event/domain/event.repository'
import { ATTENDEE_REPOSITORY, EVENT_REPOSITORY, SECRET_SANTA_REPOSITORY } from '../../repositories'
import { CreateSecretSantaCommand } from '../domain/command/create-secret-santa.command'
import { SecretSanta } from '../domain/model/secret-santa.model'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'
import { secretSantaMapper } from '../infrastructure/secret-santa.mapper'

@CommandHandler(CreateSecretSantaCommand)
export class CreateSecretSantaUseCase implements IInferredCommandHandler<CreateSecretSantaCommand> {
  constructor(
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
  ) {}

  async execute(command: CreateSecretSantaCommand): Promise<SecretSantaDto> {
    const alreadyExists = await this.secretSantaRepository.existsForEvent(command.eventId)

    if (alreadyExists) {
      throw new ConflictException('Secret santa already exists for event')
    }

    const eventAttendees = await this.attendeeRepository.findByEventId(command.eventId)

    if (!Event.canEdit({ currentUser: command.currentUser, attendees: eventAttendees })) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    const event = await this.eventRepository.findByIdOrFail(command.eventId)

    const secretSanta = SecretSanta.create({
      eventId: command.eventId,
      budget: command.budget,
      description: command.description,
    })

    await this.secretSantaRepository.save(secretSanta)

    return secretSantaMapper.toSecretSantaDto(secretSanta, event, [])
  }
}
