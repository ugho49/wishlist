import { BadRequestException, ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { EventRepository } from '@wishlist/api/event'
import { EVENT_REPOSITORY, SECRET_SANTA_REPOSITORY, SECRET_SANTA_USER_REPOSITORY } from '@wishlist/api/repositories'

import {
  SecretSantaRepository,
  SecretSantaStartedEvent,
  SecretSantaUserRepository,
  StartSecretSantaCommand,
} from '../domain'

@CommandHandler(StartSecretSantaCommand)
export class StartSecretSantaUseCase implements IInferredCommandHandler<StartSecretSantaCommand> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    private readonly eventBus: EventBus,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: StartSecretSantaCommand): Promise<void> {
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
      secretSanta = secretSanta.startAndAssignDraw()
    } catch (error) {
      throw new BadRequestException(error)
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.secretSantaUserRepository.saveAll(secretSanta.users, tx)
      await this.secretSantaRepository.save(secretSanta, tx)
    })

    const drawns: { email: string; secretSantaName: string }[] = []

    for (const user of secretSanta.users) {
      const attendee = event.attendees.find(a => a.id === user.attendeeId)!
      const drawSecretSantaUser = secretSanta.users.find(s => s.id === user.drawUserId)!
      const drawAttendee = event.attendees.find(a => a.id === drawSecretSantaUser?.attendeeId)!

      drawns.push({
        email: attendee.getEmail(),
        secretSantaName: drawAttendee.getFullNameOrPendingEmail(),
      })
    }

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
