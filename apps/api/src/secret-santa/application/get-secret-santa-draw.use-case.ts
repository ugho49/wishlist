import type { GetSecretSantaDrawResult } from '../domain/query/get-secret-santa-draw.query'

import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { EventAttendeeRepository } from '../../attendee/domain/event-attendee.repository'
import { attendeeMapper } from '../../attendee/infrastructure/event-attendee.mapper'
import { EVENT_ATTENDEE_REPOSITORY, SECRET_SANTA_USER_REPOSITORY } from '../../repositories'
import { GetSecretSantaDrawQuery } from '../domain/query/get-secret-santa-draw.query'
import { SecretSantaUserRepository } from '../domain/repository/secret-santa-user.repository'

@QueryHandler(GetSecretSantaDrawQuery)
export class GetSecretSantaDrawUseCase implements IInferredQueryHandler<GetSecretSantaDrawQuery> {
  constructor(
    @Inject(SECRET_SANTA_USER_REPOSITORY) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(EVENT_ATTENDEE_REPOSITORY) private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(query: GetSecretSantaDrawQuery): Promise<GetSecretSantaDrawResult> {
    const secretSantaUser = await this.secretSantaUserRepository.findDrawSecretSantaUserForEvent({
      eventId: query.eventId,
      userId: query.currentUser.id,
    })

    if (!secretSantaUser) return undefined

    const attendee = await this.attendeeRepository.findById(secretSantaUser.attendeeId)

    return attendee ? attendeeMapper.toAttendeeDto(attendee) : undefined
  }
}
