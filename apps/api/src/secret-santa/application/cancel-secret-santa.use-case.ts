import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { EventRepository } from '@wishlist/api/event'
import { EVENT_REPOSITORY, SECRET_SANTA_REPOSITORY, SECRET_SANTA_USER_REPOSITORY } from '@wishlist/api/repositories'

import {
  CancelSecretSantaCommand,
  SecretSantaCancelledEvent,
  SecretSantaRepository,
  SecretSantaUserRepository,
} from '../domain'

@CommandHandler(CancelSecretSantaCommand)
export class CancelSecretSantaUseCase implements IInferredCommandHandler<CancelSecretSantaCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    const cancelledSecretSanta = secretSanta.cancel()

    await this.transactionManager.runInTransaction(async tx => {
      await this.secretSantaRepository.save(cancelledSecretSanta, tx)
      await this.secretSantaUserRepository.saveAll(cancelledSecretSanta.users, tx)
    })

    const secretSantaAttendeeIds = cancelledSecretSanta.users.map(user => user.attendeeId)
    const attendeeEmails = event.attendees
      .filter(attendee => secretSantaAttendeeIds.includes(attendee.id))
      .map(attendee => attendee.getEmail())

    await this.eventBus.publish(
      new SecretSantaCancelledEvent({
        eventTitle: event.title,
        eventId: cancelledSecretSanta.eventId,
        attendeeEmails,
      }),
    )
  }
}
