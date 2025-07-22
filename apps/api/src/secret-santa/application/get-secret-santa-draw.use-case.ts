import type { GetSecretSantaDrawResult } from '../domain'

import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { eventAttendeeMapper, EventAttendeeRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetSecretSantaDrawQuery, SecretSantaUserRepository } from '../domain'

@QueryHandler(GetSecretSantaDrawQuery)
export class GetSecretSantaDrawUseCase implements IInferredQueryHandler<GetSecretSantaDrawQuery> {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(query: GetSecretSantaDrawQuery): Promise<GetSecretSantaDrawResult> {
    const secretSantaUser = await this.secretSantaUserRepository.findDrawSecretSantaUserForEvent({
      eventId: query.eventId,
      userId: query.currentUser.id,
    })

    if (!secretSantaUser) return undefined

    const attendee = await this.attendeeRepository.findById(secretSantaUser.attendeeId)

    return attendee ? eventAttendeeMapper.toAttendeeDto(attendee) : undefined
  }
}
