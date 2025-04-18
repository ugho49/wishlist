import type { GetSecretSantaResult } from '../query/get-secret-santa.query'

import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { toSecretSantaDto } from '../../infrastructure/secret-santa.mapper'
import { SecretSantaRepository } from '../../infrastructure/secret-santa.repository'
import { GetSecretSantaQuery } from '../query/get-secret-santa.query'

@QueryHandler(GetSecretSantaQuery)
export class GetSecretSantaHandler implements IInferredQueryHandler<GetSecretSantaQuery> {
  constructor(private readonly secretSantaRepository: SecretSantaRepository) {}

  async execute(query: GetSecretSantaQuery): Promise<GetSecretSantaResult> {
    const secretSanta = await this.secretSantaRepository
      .getSecretSantaForEventAndUser({
        eventId: query.eventId,
        userId: query.userId,
      })
      .then(entity => (entity ? toSecretSantaDto(entity) : null))

    return secretSanta ?? undefined
  }
}
