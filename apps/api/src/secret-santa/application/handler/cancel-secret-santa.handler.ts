import { BadRequestException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { SecretSantaStatus } from '@wishlist/common-types'

import { toAttendeeDto } from '../../../attendee/attendee.mapper'
import { SecretSantaEntity, SecretSantaUserEntity } from '../../infrastructure/secret-santa.entity'
import { SecretSantaRepository } from '../../infrastructure/secret-santa.repository'
import { CancelSecretSantaCommand } from '../command/cancel-secret-santa.command'
import { SecretSantaCancelledEvent } from '../event/secret-santa-cancelled.event'

@CommandHandler(CancelSecretSantaCommand)
export class CancelSecretSantaHandler implements IInferredCommandHandler<CancelSecretSantaCommand> {
  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isCreated()) {
      throw new BadRequestException('Secret santa not yet started')
    }

    await this.secretSantaRepository.transaction(async em => {
      await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.CREATED })
      await em.update(SecretSantaUserEntity, { secretSantaId: secretSanta.id }, { drawUserId: null })
    })

    const event = await secretSanta.event
    const users = await secretSanta.users
    const attendees = await Promise.all(users.map(u => u.attendee.then(toAttendeeDto)))

    await this.eventBus.publish(
      new SecretSantaCancelledEvent({
        eventTitle: event.title,
        eventId: event.id,
        attendeeEmails: attendees.map(a => a.pending_email ?? a.user?.email ?? ''),
      }),
    )
  }
}
