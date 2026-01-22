import { Inject, Injectable } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { EventId, ICurrentUser } from '@wishlist/common'

import { Event } from '../../domain'

export type GetEventsByIdsInput = {
  currentUser: ICurrentUser
  eventIds: EventId[]
}

@Injectable()
export class GetEventsByIdsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsByIdsInput): Promise<Event[]> {
    const events = await this.eventRepository.findByIds(input.eventIds)

    return events.filter(event => event.canView(input.currentUser))
  }
}
