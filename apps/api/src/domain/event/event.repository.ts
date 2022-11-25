import { Injectable } from '@nestjs/common';
import { EventEntity } from './event.entity';
import { BaseRepository } from '@wishlist/common-database';
import { Brackets, In } from 'typeorm';

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {
  findAllForUserid(params: { userId: string; pageSize: number; offset: number }): Promise<[EventEntity[], number]> {
    const { userId, offset, pageSize } = params;

    // TODO Change with union all when available -->

    const fetchQuery = this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoinAndSelect('e.creator', 'c')
      .leftJoinAndSelect('e.attendees', 'a')
      .where(this.whereCreatorIdOrAttendee(userId))
      .andWhere('e.eventDate >= CURRENT_DATE')
      .orderBy('e.eventDate, e.updatedAt', 'DESC')
      .limit(pageSize)
      .offset(offset)
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
