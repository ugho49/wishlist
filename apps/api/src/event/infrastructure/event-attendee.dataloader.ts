import { Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { AttendeeId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetEventAttendeesByIdsQuery } from '../domain'
import { GqlEventAttendee } from './event.dto'
import { eventMapper } from './event.mapper'

@Injectable()
export class EventAttendeeDataLoaderFactory {
  constructor(private readonly queryBus: QueryBus) {}

  createLoader() {
    return new DataLoader<AttendeeId, GqlEventAttendee | null>(async (attendeeIds: readonly AttendeeId[]) => {
      const attendees = await this.queryBus.execute(new GetEventAttendeesByIdsQuery({ attendeeIds: [...attendeeIds] }))

      // Map attendees to maintain order and length matching input IDs
      const attendeeMap = new Map(attendees.map(a => [a.id, eventMapper.toGqlEventAttendee(a)]))

      return attendeeIds.map(id => attendeeMap.get(id) ?? null)
    })
  }
}
