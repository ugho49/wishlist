import { Injectable } from '@nestjs/common'
import { AttendeeId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetEventAttendeesByIdsUseCase } from '../application/query/get-event-attendees-by-ids.use-case'
import { GqlEventAttendee } from './event.dto'
import { eventMapper } from './event.mapper'

@Injectable()
export class EventAttendeeDataLoaderFactory {
  constructor(private readonly getEventAttendeesByIdsUseCase: GetEventAttendeesByIdsUseCase) {}

  createLoader() {
    return new DataLoader<AttendeeId, GqlEventAttendee | null>(async (attendeeIds: readonly AttendeeId[]) => {
      const attendees = await this.getEventAttendeesByIdsUseCase.execute({ attendeeIds: [...attendeeIds] })

      // Map attendees to maintain order and length matching input IDs
      const attendeeMap = new Map(attendees.map(a => [a.id, eventMapper.toGqlEventAttendee(a)]))

      return attendeeIds.map(id => attendeeMap.get(id) ?? null)
    })
  }
}
