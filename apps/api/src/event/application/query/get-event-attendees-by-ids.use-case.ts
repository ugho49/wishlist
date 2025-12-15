import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { EventAttendee, EventAttendeeRepository, GetEventAttendeesByIdsQuery } from '../../domain'

@QueryHandler(GetEventAttendeesByIdsQuery)
export class GetEventAttendeesByIdsUseCase implements IInferredQueryHandler<GetEventAttendeesByIdsQuery> {
  constructor(@Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly eventAttendeeRepository: EventAttendeeRepository) {}

  execute(query: GetEventAttendeesByIdsQuery): Promise<EventAttendee[]> {
    return this.eventAttendeeRepository.findByIds(query.attendeeIds)
  }
}
