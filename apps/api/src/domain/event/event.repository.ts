import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/common-database'
import { In } from 'typeorm'

import { EventEntity } from './event.entity'

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {
  findAll(params: { take: number; skip: number }): Promise<[EventEntity[], number]> {
    const { take, skip } = params

    const fetchQuery = this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoinAndSelect('e.attendees', 'a')
      .orderBy('e.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getMany()

    const countQuery = this.createQueryBuilder('e').getCount()

    return Promise.all([fetchQuery, countQuery])
  }

  findAllForUserid(params: {
    userId: string
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

  findByIdAndUserId(params: { eventId: string; userId: string }): Promise<EventEntity | null> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoin('e.attendees', 'a')
      .where('e.id = :eventId', { eventId: params.eventId })
      .andWhere('a.userId = :userId', { userId: params.userId })
      .getOne()
  }

  findByIdsAndUserId(params: { eventIds: string[]; userId: string }): Promise<EventEntity[]> {
    return this.createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where({ id: In(params.eventIds) })
      .andWhere('a.userId = :userId', { userId: params.userId })
      .getMany()
  }
}
