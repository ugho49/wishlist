import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type AttendeeId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { EventAttendee } from '../../domain/model/event-attendee.model';

export type GetEventAttendeesByIdsInput = {
  attendeeIds: AttendeeId[];
};

@Injectable()
export class GetEventAttendeesByIdsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly eventAttendeeRepository: EventAttendeeRepository) {}

  execute(input: GetEventAttendeesByIdsInput): Promise<EventAttendee[]> {
    return this.eventAttendeeRepository.findByIds(input.attendeeIds);
  }
}
