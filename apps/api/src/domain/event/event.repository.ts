import { Injectable } from '@nestjs/common';
import { EventEntity } from './entities/event.entity';
import { BaseRepository } from '@wishlist/common-database';
import { Brackets } from 'typeorm';

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {
  async getUserEventsPaginated(params: {
    userId: string;
    pageSize: number;
    offset: number;
  }): Promise<[EventEntity[], number]> {
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

    return await Promise.all([fetchQuery, countQuery]);
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

  private whereCreatorIdOrAttendee(userId: string) {
    return new Brackets((cb) =>
      cb.where('e.creatorId = :userId', { userId }).orWhere('a.userId = :userId', { userId })
    );
  }
}
