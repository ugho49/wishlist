import type { SecretSantaUserId } from '@wishlist/common-types'
import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { SecretSantaId, UserId } from '@wishlist/common-types'
import { In } from 'typeorm'

import { BusService } from '../../../core/bus/bus.service'
import { SecretSantaRepository, SecretSantaUserRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  secretSantaId: SecretSantaId
  secretSantaUserId: SecretSantaUserId
  exclusions: SecretSantaUserId[]
}

export type UpdateSecretSantaUserHandlerDefinition = CommandHandlerDefinition<'updateSecretSantaUser', Command, void>

@Injectable()
export class UpdateSecretSantaUserUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {
    busService.registerCommandHandler('updateSecretSantaUser', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: message.secretSantaId,
      userId: message.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    const secretSantaUsers =
      message.exclusions.length === 0
        ? []
        : await this.secretSantaUserRepository.findBy({
            id: In(message.exclusions),
            secretSantaId: message.secretSantaId,
          })

    const exclusionsIds = secretSantaUsers.map(u => u.id)

    if (exclusionsIds.includes(message.secretSantaUserId)) {
      throw new BadRequestException('Secret santa user cannot exclude himself')
    }

    await this.secretSantaUserRepository.update(
      { id: message.secretSantaUserId },
      {
        exclusions: exclusionsIds,
      },
    )
  }
}
