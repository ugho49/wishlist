import type { EventId, SecretSantaDto, UserId } from '@wishlist/common-types'
import type { Envelope, QueryHandlerDefinition } from 'missive.js'

import { Inject, Injectable } from '@nestjs/common'
import { z } from 'zod'

import { QUERY_BUS, QueryBus } from '../../../core/bus/bus.module'
import { SecretSantaService } from '../secret-santa.service'

const getSecretSantaQuerySchema = z.object({
  userId: z.string(),
  eventId: z.string(),
})
type Query = z.infer<typeof getSecretSantaQuerySchema>
type Result = SecretSantaDto | undefined

export type GetSecretSantaHandlerDefinition = QueryHandlerDefinition<'getSecretSanta', Query, Result>

@Injectable()
export class GetSecretSantaUseCase {
  constructor(
    @Inject(QUERY_BUS) queryBus: QueryBus,
    private readonly secretSantaService: SecretSantaService,
  ) {
    queryBus.register('getSecretSanta', getSecretSantaQuerySchema, this.handle.bind(this))
  }

  async handle(envelope: Envelope<Query>): Promise<Result> {
    const secretSanta = await this.secretSantaService.getForEvent({
      currentUserId: envelope.message.userId as UserId,
      eventId: envelope.message.eventId as EventId,
    })

    return secretSanta ?? undefined
  }
}
