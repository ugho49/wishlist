import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { Event, GetEventsByIdsQuery } from '../../domain'

@QueryHandler(GetEventsByIdsQuery)
export class GetEventsByIdsUseCase implements IInferredQueryHandler<GetEventsByIdsQuery> {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsByIdsQuery): Promise<Event[]> {
    const events = await this.eventRepository.findByIds(query.eventIds)

    return events.filter(event => event.canView(query.currentUser))
  }
}
