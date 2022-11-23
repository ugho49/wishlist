import { Injectable } from '@nestjs/common';
import { EventEntity } from './entities/event.entity';
import { BaseRepository } from '@wishlist/common-database';

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {
  async getUserEventsPaginated(params: {
    userId: string;
    pageSize: number;
    offset: number;
  }): Promise<[EventEntity[], number]> {
    const { userId, offset, pageSize } = params;

    const fetchQuery = this.query(
      `SELECT * FROM (
          SELECT * FROM (
            SELECT DISTINCT e.* FROM event e
            LEFT OUTER JOIN event_attendee a ON a.event_id = e.id
            WHERE (e.creator_id = $1 OR a.user_id = $1) AND e.event_date >= CURRENT_DATE
            ORDER BY e.event_date, e.updated_at DESC
          ) AS future_events
          UNION ALL
          SELECT * FROM (
            SELECT DISTINCT e.* FROM event e
            LEFT OUTER JOIN event_attendee a ON a.event_id = e.id
            WHERE (e.creator_id = $1 OR a.user_id = $1) AND e.event_date < CURRENT_DATE
            ORDER BY e.event_date DESC
          ) AS past_events
      ) AS all_events LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    );

    const countQuery = this.createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where('e.creator_id = :userId OR a.user_id = :userId', { userId })
      .getCount();

    return await Promise.all([fetchQuery, countQuery]);
  }

  findByIdAndUserId(params: { eventId: string; userId: string }): Promise<EventEntity | null> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.wishlists', 'w')
      .leftJoinAndSelect('e.creator', 'c')
      .leftJoinAndSelect('e.attendees', 'a')
      .where('e.id = :eventId', { eventId: params.eventId })
      .andWhere('(e.creator.id = :userId OR a.user.id = :userId)', { userId: params.userId })
      .getOne();
  }
}
