import type { CommandHandlerDefinition, Envelope } from 'missive.js'

import { ForbiddenException, Injectable } from '@nestjs/common'
import { SecretSantaId, UserId } from '@wishlist/common-types'

import { BusService } from '../../../core/bus/bus.service'
import { SecretSantaRepository } from '../secret-santa.repository'

type Command = {
  userId: UserId
  secretSantaId: SecretSantaId
  description?: string
  budget?: number
}

export type UpdateSecretSantaHandlerDefinition = CommandHandlerDefinition<'updateSecretSanta', Command, void>

@Injectable()
export class UpdateSecretSantaUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
  ) {
    busService.registerCommandHandler('updateSecretSanta', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Command>): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: message.secretSantaId,
      userId: message.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaRepository.update(
      { id: secretSanta.id },
      {
        description: message.description ?? null,
        budget: message.budget ?? null,
      },
    )
  }
}
