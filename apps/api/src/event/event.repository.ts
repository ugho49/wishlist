import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/common-database'
import { EventId, UserId } from '@wishlist/common-types'
import { In } from 'typeorm'

import { EventEntity } from './event.entity'

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {
  findAll(params: { take: number; skip: number; userId?: UserId }): Promise<[EventEntity[], number]> {
    const { take, skip } = params

    let fetchQueryBuilder = this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoin('e.attendees', 'a')

    if (params.userId) {
      fetchQueryBuilder = fetchQueryBuilder.where('a.userId = :userId', { userId: params.userId })
    }

    const fetchQuery = fetchQueryBuilder.orderBy('e.createdAt', 'DESC').take(take).skip(skip).getMany()

    let countQueryBuilder = this.createQueryBuilder('e')

    if (params.userId) {
      countQueryBuilder = countQueryBuilder
        .leftJoin('e.attendees', 'a')
        .where('a.userId = :userId', { userId: params.userId })
    }

    const countQuery = countQueryBuilder.getCount()

    return Promise.all([fetchQuery, countQuery])
  }

  findAllForUserid(params: {
    userId: UserId
    take: number
    skip: number
    onlyFuture: boolean
  }): Promise<[EventEntity[], number]> {
    const { userId, take, skip, onlyFuture } = params

    const fetchQueryBuilder = this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoin('e.attendees', 'a')
      .where('a.userId = :userId', { userId })
      .orderBy('e.eventDate', 'DESC')
      .addOrderBy('e.createdAt', 'DESC')
      .take(take)
      .skip(skip)

    const countQueryBuilder = this.createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where('a.userId = :userId', { userId })

    if (onlyFuture) {
      fetchQueryBuilder.andWhere('e.eventDate >= CURRENT_DATE')
      countQueryBuilder.andWhere('e.eventDate >= CURRENT_DATE')
    }

    return Promise.all([fetchQueryBuilder.getMany(), countQueryBuilder.getCount()])
  }

  findByIdAndUserId(params: { eventId: EventId; userId: UserId }): Promise<EventEntity | null> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoin('e.attendees', 'a')
      .where('e.id = :eventId', { eventId: params.eventId })
      .andWhere('a.userId = :userId', { userId: params.userId })
      .getOne()
  }

  findByIdsAndUserId(params: { eventIds: EventId[]; userId: UserId }): Promise<EventEntity[]> {
    return this.createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where({ id: In(params.eventIds) })
      .andWhere('a.userId = :userId', { userId: params.userId })
      .getMany()
  }
}
