import type { GetSecretSantaResult } from '../domain/query/get-secret-santa.query'

import { ForbiddenException, Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetSecretSantaQuery, SecretSantaRepository } from '../domain'
import { secretSantaMapper } from '../infrastructure'

@QueryHandler(GetSecretSantaQuery)
export class GetSecretSantaUseCase implements IInferredQueryHandler<GetSecretSantaQuery> {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: GetSecretSantaQuery): Promise<GetSecretSantaResult> {
    const secretSanta = await this.secretSantaRepository.findForEvent({
      eventId: query.eventId,
    })

    if (!secretSanta) return undefined

    const event = await this.eventRepository.findByIdOrFail(query.eventId)

    if (!event.canView(query.currentUser)) {
      throw new ForbiddenException('Event cannot be viewed by this user')
    }

    return secretSantaMapper.toSecretSantaDto(secretSanta, event)
  }
}
