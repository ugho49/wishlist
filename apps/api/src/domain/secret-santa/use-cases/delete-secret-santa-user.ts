import type { SecretSantaUserId } from '@wishlist/common-types'
import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { ForbiddenException, Injectable } from '@nestjs/common'
import { SecretSantaId, UserId } from '@wishlist/common-types'
import { ArrayContains } from 'typeorm'

import { BusService } from '../../../core/bus/bus.service'
import { SecretSantaUserEntity } from '../secret-santa.entity'
import { SecretSantaRepository, SecretSantaUserRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  secretSantaId: SecretSantaId
  secretSantaUserId: SecretSantaUserId
}

export type DeleteSecretSantaUserHandlerDefinition = CommandHandlerDefinition<'deleteSecretSantaUser', Command, void>

@Injectable()
export class DeleteSecretSantaUserUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {
    busService.registerCommandHandler('deleteSecretSantaUser', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: message.secretSantaId,
      userId: message.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaUserRepository.transaction(async em => {
      await em.delete(SecretSantaUserEntity, { id: message.secretSantaUserId })
      await em.update(
        SecretSantaUserEntity,
        { exclusions: ArrayContains([message.secretSantaUserId]) },
        { exclusions: () => `array_remove(exclusions, '${message.secretSantaUserId}')` },
      )
    })
  }
}
