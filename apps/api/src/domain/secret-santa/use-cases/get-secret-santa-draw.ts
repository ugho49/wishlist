import type { Envelope, QueryHandlerDefinition } from 'missive.js'

import { Injectable } from '@nestjs/common'
import { AttendeeDto, EventId, UserId } from '@wishlist/common-types'

import { BusService } from '../../../core/bus/bus.service'
import { toAttendeeDto } from '../../attendee/attendee.mapper'
import { SecretSantaUserRepository } from '../secret-santa.repository'

type Query = {
  userId: UserId
  eventId: EventId
}
type Result = AttendeeDto | undefined

export type GetSecretSantaDrawHandlerDefinition = QueryHandlerDefinition<'getSecretSantaDraw', Query, Result>

@Injectable()
export class GetSecretSantaDrawUseCase {
  constructor(
    busService: BusService,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {
    busService.registerQueryHandler('getSecretSantaDraw', envelope => this.handle(envelope))
  }

  async handle({ message }: Envelope<Query>): Promise<Result> {
    const attendee = await this.secretSantaUserRepository
      .getDrawSecretSantaUserForEvent({
        eventId: message.eventId,
        userId: message.userId,
      })
      .then(entity => (entity ? entity.attendee : null))
      .then(entity => (entity ? toAttendeeDto(entity) : null))

    return attendee ?? undefined
  }
}
