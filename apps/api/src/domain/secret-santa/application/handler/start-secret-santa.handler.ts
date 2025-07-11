import { BadRequestException, ForbiddenException, UnprocessableEntityException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { SecretSantaDrawService, SecretSantaStatus } from '@wishlist/common'

import { SecretSantaEntity, SecretSantaUserEntity } from '../../infrastructure/secret-santa.entity'
import { toSecretSantaUserWithDrawDto } from '../../infrastructure/secret-santa.mapper'
import { SecretSantaRepository, SecretSantaUserRepository } from '../../infrastructure/secret-santa.repository'
import { StartSecretSantaCommand } from '../command/start-secret-santa.command'
import { SecretSantaStartedEvent } from '../event/secret-santa-started.event'

@CommandHandler(StartSecretSantaCommand)
export class StartSecretSantaHandler implements IInferredCommandHandler<StartSecretSantaCommand> {
  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: StartSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    const event = await secretSanta.event

    if (event.eventDate < new Date()) {
      throw new BadRequestException('Event is already finished')
    }

    let secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id })

    try {
      const drawService = new SecretSantaDrawService(
        secretSantaUsers.map(ss => ({ id: ss.id, exclusions: ss.exclusions })),
      )
      const assignedUsers = drawService.assignSecretSantas()

      await this.secretSantaRepository.transaction(async em => {
        for (const user of assignedUsers) {
          await em.update(SecretSantaUserEntity, { id: user.userId }, { drawUserId: user.drawUserId })
        }

        await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.STARTED })
      })
    } catch {
      throw new UnprocessableEntityException('Failed to draw secret santa, please try again')
    }

    secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id })
    const secretSantaDto = await Promise.all(secretSantaUsers.map(ss => toSecretSantaUserWithDrawDto(ss)))

    await this.eventBus.publish(
      new SecretSantaStartedEvent({
        eventTitle: event.title,
        eventId: event.id,
        budget: secretSanta.budget ?? undefined,
        description: secretSanta.description ?? undefined,
        drawns: secretSantaDto.map(ss => ({
          email: ss.attendee.pending_email ?? ss.attendee.user?.email ?? '',
          secretSantaName: ss.draw?.pending_email ?? `${ss.draw?.user?.firstname} ${ss.draw?.user?.lastname}`,
        })),
      }),
    )
  }
}
