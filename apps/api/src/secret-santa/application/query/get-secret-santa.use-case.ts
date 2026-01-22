import type { EventId, ICurrentUser, SecretSantaDto } from '@wishlist/common'

import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaRepository } from '../../domain'
import { secretSantaMapper } from '../../infrastructure'

export type GetSecretSantaInput = {
  currentUser: ICurrentUser
  eventId: EventId
}

export type GetSecretSantaResult = SecretSantaDto | undefined

@Injectable()
export class GetSecretSantaUseCase {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: GetSecretSantaInput): Promise<GetSecretSantaResult> {
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
