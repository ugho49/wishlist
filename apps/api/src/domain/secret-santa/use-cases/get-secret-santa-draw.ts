import type { Envelope, QueryHandlerDefinition } from 'missive.js'

import { Inject, Injectable } from '@nestjs/common'
import { AttendeeDto, EventId, UserId } from '@wishlist/common-types'
import { z } from 'zod'

import { QUERY_BUS, QueryBus } from '../../../core/bus/bus.module'
import { SecretSantaService } from '../secret-santa.service'

const getSecretSantaDrawQuerySchema = z.object({
  userId: z.string(),
  eventId: z.string(),
})
type Query = z.infer<typeof getSecretSantaDrawQuerySchema>
type Result = AttendeeDto | undefined

export type GetSecretSantaDrawHandlerDefinition = QueryHandlerDefinition<'getSecretSantaDraw', Query, Result>

@Injectable()
export class GetSecretSantaDrawUseCase {
  constructor(
    @Inject(QUERY_BUS) queryBus: QueryBus,
    private readonly secretSantaService: SecretSantaService,
  ) {
    queryBus.register('getSecretSantaDraw', getSecretSantaDrawQuerySchema, this.handle.bind(this))
  }

  async handle(envelope: Envelope<Query>): Promise<Result> {
    const secretSanta = await this.secretSantaService.getMyDrawForEvent({
      currentUserId: envelope.message.userId as UserId,
      eventId: envelope.message.eventId as EventId,
    })

    return secretSanta ?? undefined
  }
}
