import { Injectable } from '@nestjs/common';
import { createPagedResponse, EventWithCountsDto, PagedResponse } from '@wishlist/common-types';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { toEventWithCountsDtoDto } from './event.mapper';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventEntityRepository: EventRepository) {}

  async getUserEventsPaginated(param: {
    pageNumber: number;
    currentUserId: string;
  }): Promise<PagedResponse<EventWithCountsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const { pageNumber, currentUserId } = param;

    const offset = pageSize * (pageNumber || 0);

    const fetchQuery = this.eventEntityRepository.query(
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
      [currentUserId, pageSize, offset]
    );

    const countQuery = this.eventEntityRepository
      .createQueryBuilder('e')
      .leftJoin('e.attendees', 'a')
      .where('e.creator_id = :userId OR a.user_id = :userId', { userId: currentUserId })
      .getCount();

    const [list, totalElements] = await Promise.all([fetchQuery, countQuery]);

    const dtos = await Promise.all(list.map((entity) => toEventWithCountsDtoDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, currentIndex: pageNumber },
    });
  }
}
