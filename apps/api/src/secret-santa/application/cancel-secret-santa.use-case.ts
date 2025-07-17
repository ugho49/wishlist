import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../attendee/domain/attendee.repository'
import { TransactionManager } from '../../core/database'
import { Event } from '../../event/domain/event.model'
import { EventRepository } from '../../event/domain/event.repository'
import {
  ATTENDEE_REPOSITORY,
  EVENT_REPOSITORY,
  SECRET_SANTA_REPOSITORY,
  SECRET_SANTA_USER_REPOSITORY,
} from '../../repositories'
import { CancelSecretSantaCommand } from '../domain/command/cancel-secret-santa.command'
import { SecretSantaCancelledEvent } from '../domain/event/secret-santa-cancelled.event'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'

@CommandHandler(CancelSecretSantaCommand)
export class CancelSecretSantaUseCase implements IInferredCommandHandler<CancelSecretSantaCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const eventAttendees = await this.attendeeRepository.findByEventId(secretSanta.eventId)

    if (!Event.canEdit({ currentUser: command.currentUser, attendees: eventAttendees })) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)
    const cancelledSecretSanta = secretSanta.cancel()

    await this.transactionManager.runInTransaction(async tx => {
      await this.secretSantaRepository.save(cancelledSecretSanta, tx)
      await this.secretSantaUserRepository.saveAll(cancelledSecretSanta.users, tx)
    })

    const attendeeIds = cancelledSecretSanta.users.map(user => user.attendeeId)
    const attendees = await this.attendeeRepository.findByIds(attendeeIds)
    const attendeeEmails = attendees.map(attendee => attendee.getEmail())

    await this.eventBus.publish(
      new SecretSantaCancelledEvent({
        eventTitle: event.title,
        eventId: cancelledSecretSanta.eventId,
        attendeeEmails,
      }),
    )
  }
}
