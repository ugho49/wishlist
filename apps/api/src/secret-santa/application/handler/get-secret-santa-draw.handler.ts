import type { GetSecretSantaDrawResult } from '../query/get-secret-santa-draw.query'

import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { toAttendeeDto } from '../../../attendee/attendee.mapper'
import { SecretSantaUserRepository } from '../../infrastructure/secret-santa.repository'
import { GetSecretSantaDrawQuery } from '../query/get-secret-santa-draw.query'

@QueryHandler(GetSecretSantaDrawQuery)
export class GetSecretSantaDrawHandler implements IInferredQueryHandler<GetSecretSantaDrawQuery> {
  constructor(private readonly secretSantaUserRepository: SecretSantaUserRepository) {}

  async execute(query: GetSecretSantaDrawQuery): Promise<GetSecretSantaDrawResult> {
    const attendee = await this.secretSantaUserRepository
      .getDrawSecretSantaUserForEvent({
        eventId: query.eventId,
        userId: query.userId,
      })
      .then(entity => (entity ? entity.attendee : null))
      .then(entity => (entity ? toAttendeeDto(entity) : null))

    return attendee ?? undefined
  }
}
