import { createPagedResponse, type EventId, type UserId } from '@wishlist/common';
import { Args, Loader, Query, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { Authenticated } from '../../../auth/infrastructure/decorators/public.metadata';
import { CurrentUserId } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { EventsById } from '../../../event/infrastructure/event.dataloader';
import {
  type EventPaginationFilters,
  type GetEventByIdResult,
  type GetMyEventsResult,
} from '../../../gql/generated-types';
import { GetEventsByUserUseCase } from '../../application/query/get-events-by-user.use-case';
import { eventMapper } from '../event.mapper';
import { EventPaginationFiltersSchema } from '../event.schema';

@Resolver()
@Authenticated()
export class EventResolver {
  constructor(private readonly getEventsByUserUseCase: GetEventsByUserUseCase) {}
  @Query()
  async event(@Args('id') id: EventId, @Loader() eventsLoader: Loader<EventsById>): Promise<GetEventByIdResult> {
    const event = await eventsLoader.load(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  @Query()
  async events(
    @Args('filters', EventPaginationFiltersSchema) filters: EventPaginationFilters,
    @CurrentUserId() currentUserId: UserId,
  ): Promise<GetMyEventsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters.page ?? 1;

    const { events, totalCount } = await this.getEventsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber,
      pageSize,
      ignorePastEvents: filters.onlyFuture ?? false,
    });

    const pagedResponse = createPagedResponse({
      resources: events.map(eventMapper.toGqlEvent),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });

    return {
      __typename: 'GetEventsPagedResponse',
      data: pagedResponse.resources,
      pagination: {
        __typename: 'Pagination',
        totalPages: pagedResponse.pagination.total_pages,
        totalElements: pagedResponse.pagination.total_elements,
        pageNumber: pagedResponse.pagination.page_number,
        pageSize: pagedResponse.pagination.pages_size,
      },
    };
  }
}
