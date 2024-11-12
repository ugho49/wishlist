import type { EventId, SecretSantaDto, UserId } from '@wishlist/common-types'
import type { Envelope, QueryHandlerDefinition } from 'missive.js'

import { Injectable } from '@nestjs/common'

import { BusService } from '../../../core/bus/bus.service'
import { toSecretSantaDto } from '../secret-santa.mapper'
import { SecretSantaRepository } from '../secret-santa.repository'

type Query = {
  userId: UserId
  eventId: EventId
}
type Result = SecretSantaDto | undefined

export type GetSecretSantaHandlerDefinition = QueryHandlerDefinition<'getSecretSanta', Query, Result>

@Injectable()
export class GetSecretSantaUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaRepository: SecretSantaRepository,
  ) {
    busService.registerQueryHandler('getSecretSanta', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Query>): Promise<Result> {
    const secretSanta = await this.secretSantaRepository
      .getSecretSantaForEventAndUser({
        eventId: message.eventId,
        userId: message.userId,
      })
      .then(entity => (entity ? toSecretSantaDto(entity) : null))

    return secretSanta ?? undefined
  }
}
