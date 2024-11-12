import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { AttendeeId, SecretSantaId, SecretSantaUserDto, UserId } from '@wishlist/common-types'

import { BusService } from '../../../core/bus/bus.service'
import { SecretSantaUserEntity } from '../secret-santa.entity'
import { toSecretSantaUserDto } from '../secret-santa.mapper'
import { SecretSantaRepository, SecretSantaUserRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  secretSantaId: SecretSantaId
  attendeeIds: AttendeeId[]
}

type Result = {
  users: SecretSantaUserDto[]
}

export type AddSecretSantaUserHandlerDefinition = CommandHandlerDefinition<'addSecretSantaUser', Command, Result>

@Injectable()
export class AddSecretSantaUserUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {
    busService.registerCommandHandler('addSecretSantaUser', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<Result> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: message.secretSantaId,
      userId: message.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    const alreadyExists = await this.secretSantaUserRepository.attendeesExistsForSecretSanta({
      secretSantaId: secretSanta.id,
      attendeeIds: message.attendeeIds,
    })

    if (alreadyExists) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    const eventAttendees = await secretSanta.event.then(event => event.attendees)

    for (const attendeeId of message.attendeeIds) {
      if (!eventAttendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const entities = message.attendeeIds.map(attendeeId =>
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
