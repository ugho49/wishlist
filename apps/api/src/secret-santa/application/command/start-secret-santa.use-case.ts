import type { ICurrentUser, SecretSantaId } from '@wishlist/common'

import { BadRequestException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { type EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { type SecretSantaRepository, SecretSantaStartedEvent, type SecretSantaUserRepository } from '../../domain'

export type StartSecretSantaInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
}

@Injectable()
export class StartSecretSantaUseCase {
  private readonly logger = new Logger(StartSecretSantaUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    private readonly eventBus: EventBus,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: StartSecretSantaInput): Promise<void> {
    this.logger.log('Start secret santa request received', { command })
    let secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)

    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    if (event.isFinished()) {
      throw new BadRequestException('Event is already finished')
    }

    try {
      this.logger.log('Starting secret santa and assigning draw...', { secretSantaId: secretSanta.id })
      secretSanta = secretSanta.startAndAssignDraw()
    } catch (error) {
      throw new BadRequestException(error)
    }

    this.logger.log('Saving secret santa...', { secretSantaId: secretSanta.id, secretSanta })
    await this.transactionManager.runInTransaction(async tx => {
      await this.secretSantaUserRepository.saveAll(secretSanta.users, tx)
      await this.secretSantaRepository.save(secretSanta, tx)
    })

    const drawns = secretSanta.users.flatMap(user => {
      const attendee = event.attendees.find(a => a.id === user.attendeeId)
      return attendee ? [{ email: attendee.getEmail() }] : []
    })

    await this.eventBus.publish(
      new SecretSantaStartedEvent({
        eventTitle: event.title,
        eventId: event.id,
        budget: secretSanta.budget ?? undefined,
        description: secretSanta.description ?? undefined,
        drawns,
      }),
    )
  }
}
