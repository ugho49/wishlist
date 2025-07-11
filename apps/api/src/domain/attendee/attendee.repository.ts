import { Injectable } from '@nestjs/common'
import { EventId } from '@wishlist/common-types'

import { BaseRepository } from '../../common'
import { AttendeeEntity } from './attendee.entity'

@Injectable()
export class AttendeeRepository extends BaseRepository(AttendeeEntity) {
  async existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean> {
    return this.createQueryBuilder('a')
      .leftJoin('a.user', 'u')
      .where({ eventId: param.eventId })
      .andWhere('(u.email = :email OR a.email = :email)', { email: param.email })
      .getExists()
  }
}
