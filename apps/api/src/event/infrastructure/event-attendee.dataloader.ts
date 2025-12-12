import { Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { AttendeeId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetEventAttendeesByIdsQuery } from '../domain'
import { EventAttendeeOutput } from './event.dto'
import { eventMapper } from './event.mapper'

@Injectable()
export class EventAttendeeDataLoaderFactory {
  private readonly logger = new Logger(EventAttendeeDataLoaderFactory.name)

  constructor(private readonly queryBus: QueryBus) {}

  createLoader() {
    return new DataLoader<AttendeeId, EventAttendeeOutput | null>(async (attendeeIds: readonly AttendeeId[]) => {
      this.logger.log('Loading attendees', { attendeeIds })

      const attendees = await this.queryBus.execute(new GetEventAttendeesByIdsQuery({ attendeeIds: [...attendeeIds] }))

      // Map attendees to maintain order and length matching input IDs
      const attendeeMap = new Map(attendees.map(a => [a.id, eventMapper.toEventAttendeeOutput(a)]))

      return attendeeIds.map(id => attendeeMap.get(id) ?? null)
    })
  }
}
