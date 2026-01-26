import type { EventId, ICurrentUser } from '@wishlist/common'

import { Inject, Injectable } from '@nestjs/common'
import { EventAttendee, EventAttendeeRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaUserRepository } from '../../domain'

export type GetSecretSantaDrawInput = {
  currentUser: ICurrentUser
  eventId: EventId
}

@Injectable()
export class GetSecretSantaDrawUseCase {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(query: GetSecretSantaDrawInput): Promise<EventAttendee | undefined> {
    const secretSantaUser = await this.secretSantaUserRepository.findDrawSecretSantaUserForEvent({
      eventId: query.eventId,
      userId: query.currentUser.id,
    })

    if (!secretSantaUser) return undefined

    return this.attendeeRepository.findById(secretSantaUser.attendeeId)
  }
}
