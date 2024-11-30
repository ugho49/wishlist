import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { SecretSantaUserEntity } from '../../infrastructure/secret-santa.entity'
import { toSecretSantaUserDto } from '../../infrastructure/secret-santa.mapper'
import { SecretSantaRepository, SecretSantaUserRepository } from '../../infrastructure/secret-santa.repository'
import { AddSecretSantaUserCommand, AddSecretSantaUserResult } from '../command/add-secret-santa-user.command'

@CommandHandler(AddSecretSantaUserCommand)
export class AddSecretSantaUserHandler implements IInferredCommandHandler<AddSecretSantaUserCommand> {
  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async execute(command: AddSecretSantaUserCommand): Promise<AddSecretSantaUserResult> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    const alreadyExists = await this.secretSantaUserRepository.attendeesExistsForSecretSanta({
      secretSantaId: secretSanta.id,
      attendeeIds: command.attendeeIds,
    })

    if (alreadyExists) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    const eventAttendees = await secretSanta.event.then(event => event.attendees)

    for (const attendeeId of command.attendeeIds) {
      if (!eventAttendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const entities = command.attendeeIds.map(attendeeId =>
      SecretSantaUserEntity.create({
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    )

    await this.secretSantaUserRepository.save(entities)

    const users = await Promise.all(entities.map(entity => toSecretSantaUserDto(entity)))

    return { users }
  }
}
