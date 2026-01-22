import type { ICurrentUser, SecretSantaId } from '@wishlist/common'

import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaCancelledEvent, SecretSantaRepository, SecretSantaUserRepository } from '../../domain'

export type CancelSecretSantaInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
}

@Injectable()
export class CancelSecretSantaUseCase {
  private readonly logger = new Logger(CancelSecretSantaUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelSecretSantaInput): Promise<void> {
    this.logger.log('Cancel secret santa request received', { command })
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    const cancelledSecretSanta = secretSanta.cancel()

    this.logger.log('Saving secret santa...', { secretSantaId: secretSanta.id, cancelledSecretSanta })
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
