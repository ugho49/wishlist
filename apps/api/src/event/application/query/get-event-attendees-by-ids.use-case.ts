import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { AttendeeId } from '@wishlist/common'

import { EventAttendee, EventAttendeeRepository } from '../../domain'

export type GetEventAttendeesByIdsInput = {
  attendeeIds: AttendeeId[]
}

@Injectable()
export class GetEventAttendeesByIdsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly eventAttendeeRepository: EventAttendeeRepository) {}

  execute(input: GetEventAttendeesByIdsInput): Promise<EventAttendee[]> {
    return this.eventAttendeeRepository.findByIds(input.attendeeIds)
  }
}
