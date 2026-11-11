import type { BatchLoad } from '@znight/graphql';

import { type AttendeeId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { type EventAttendee } from '../../gql/generated-types';
import { GetEventAttendeesByIdsUseCase } from '../application/query/get-event-attendees-by-ids.use-case';
import { eventMapper } from './event.mapper';

@Injectable()
export class EventAttendeesById implements BatchLoad<AttendeeId, EventAttendee | null> {
  constructor(private readonly getEventAttendeesByIdsUseCase: GetEventAttendeesByIdsUseCase) {}

  async load(attendeeIds: readonly AttendeeId[]): Promise<readonly (EventAttendee | null)[]> {
    const attendees = await this.getEventAttendeesByIdsUseCase.execute({ attendeeIds: [...attendeeIds] });

    // Map attendees to maintain order and length matching input IDs
    const attendeeMap = new Map(attendees.map(a => [a.id, eventMapper.toGqlEventAttendee(a)]));

    return attendeeIds.map(id => attendeeMap.get(id) ?? null);
  }
}
