import { Injectable } from '@nestjs/common'
import { AttendeeId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { EventAttendee } from '../../gql/generated-types'
import { GetEventAttendeesByIdsUseCase } from '../application/query/get-event-attendees-by-ids.use-case'
import { eventAttendeeMapper } from './event-attendee.mapper'

@Injectable()
export class EventAttendeeDataLoaderFactory {
  constructor(private readonly getEventAttendeesByIdsUseCase: GetEventAttendeesByIdsUseCase) {}

  createLoader() {
    return new DataLoader<AttendeeId, EventAttendee | null>(async (attendeeIds: readonly AttendeeId[]) => {
      const attendees = await this.getEventAttendeesByIdsUseCase.execute({ attendeeIds: [...attendeeIds] })

      // Map attendees to maintain order and length matching input IDs
      const attendeeMap = new Map(attendees.map(a => [a.id, eventAttendeeMapper.toGqlEventAttendee(a)]))

      return attendeeIds.map(id => attendeeMap.get(id) ?? null)
    })
  }
}
