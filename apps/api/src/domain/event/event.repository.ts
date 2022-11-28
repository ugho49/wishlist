import { Injectable } from '@nestjs/common';
import { EventEntity } from './event.entity';
import { BaseRepository } from '@wishlist/common-database';
import { Brackets, In } from 'typeorm';

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {
  findAll(params: { take: number; skip: number }): Promise<[EventEntity[], number]> {
    const { take, skip } = params;

    const fetchQuery = this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoinAndSelect('e.creator', 'c')
      .leftJoinAndSelect('e.attendees', 'a')
      .orderBy('e.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getMany();

    const countQuery = this.createQueryBuilder('e').getCount();

    return Promise.all([fetchQuery, countQuery]);
  }

  findAllForUserid(params: { userId: string; take: number; skip: number }): Promise<[EventEntity[], number]> {
    const { userId, take, skip } = params;

    // TODO Change with union all when available -->

    const fetchQuery = this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoinAndSelect('e.creator', 'c')
      .leftJoinAndSelect('e.attendees', 'a')
      .where(this.whereCreatorIdOrAttendee(userId))
      .orderBy('e.updatedAt', 'DESC')
      .addOrderBy('e.eventDate', 'DESC')
      .take(take)
      .skip(skip)
      .getMany();

    const countQuery = this.createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where(this.whereCreatorIdOrAttendee(userId))
      .getCount();

    return Promise.all([fetchQuery, countQuery]);
  }

  findByIdAndUserId(params: { eventId: string; userId: string }): Promise<EventEntity | null> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoinAndSelect('e.creator', 'c')
      .leftJoinAndSelect('e.attendees', 'a')
      .where('e.id = :eventId', { eventId: params.eventId })
      .andWhere(this.whereCreatorIdOrAttendee(params.userId))
      .getOne();
  }

  findByIdsAndUserId(params: { eventIds: string[]; userId: string }): Promise<EventEntity[]> {
    return this.createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where({ id: In(params.eventIds) })
      .andWhere(this.whereCreatorIdOrAttendee(params.userId))
      .getMany();
  }

  private whereCreatorIdOrAttendee(userId: string) {
    return new Brackets((cb) =>
      cb.where('e.creatorId = :userId', { userId }).orWhere('a.userId = :userId', { userId })
    );
  }
}
