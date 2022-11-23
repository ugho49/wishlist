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

    const [entities, totalElements] = await this.eventEntityRepository.getUserEventsPaginated({
      userId: currentUserId,
      pageSize,
      offset,
    });

    const dtos = await Promise.all(entities.map((entity) => toEventWithCountsDtoDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, currentIndex: pageNumber },
    });
  }
}
