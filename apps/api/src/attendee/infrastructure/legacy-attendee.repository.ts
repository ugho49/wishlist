import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/api/core'
import { EventId } from '@wishlist/common'

import { AttendeeEntity } from './legacy-attendee.entity'

@Injectable()
export class LegacyAttendeeRepository extends BaseRepository(AttendeeEntity) {
  existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean> {
    return this.createQueryBuilder('a')
      .leftJoin('a.user', 'u')
      .where({ eventId: param.eventId })
      .andWhere('(u.email = :email OR a.email = :email)', { email: param.email })
      .getExists()
  }

  findByEventId(eventId: EventId): Promise<AttendeeEntity[]> {
    return this.findBy({ eventId })
  }
}
