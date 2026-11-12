import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type AttendeeId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { EventAttendee } from '../../domain/model/event-attendee.model';

export type GetEventAttendeesByIdsInput = {
  attendeeIds: AttendeeId[];
};

@Injectable()
export class GetEventAttendeesByIdsUseCase {
  constructor(private readonly eventAttendeeRepository: EventAttendeeRepository) {}

  execute(input: GetEventAttendeesByIdsInput): Promise<EventAttendee[]> {
    return this.eventAttendeeRepository.findByIds(input.attendeeIds);
  }
}
