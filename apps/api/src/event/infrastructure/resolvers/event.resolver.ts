import { NotFoundException } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { createPagedResponse, type EventId, type ICurrentUser, type UserId } from '@wishlist/common';

import { OptionalAuth } from '../../../auth/infrastructure/decorators/optional-auth.metadata';
import { Public } from '../../../auth/infrastructure/decorators/public.metadata';
import { GqlCurrentUser, GqlOptionalUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import {
  type EventInvitePreviewResult,
  type EventPaginationFilters,
  type GetEventByIdResult,
  type GetMyEventsResult,
} from '../../../gql/generated-types';
import { GetEventInvitePreviewUseCase } from '../../application/query/get-event-invite-preview.use-case';
import { GetEventsByUserUseCase } from '../../application/query/get-events-by-user.use-case';
import { eventMapper } from '../event.mapper';
import { EventInviteTokenSchema, EventPaginationFiltersSchema } from '../event.schema';

@Resolver()
export class EventResolver {
  constructor(
    private readonly getEventsByUserUseCase: GetEventsByUserUseCase,
    private readonly getEventInvitePreviewUseCase: GetEventInvitePreviewUseCase,
  ) {}

  @Query()
  async event(
    @Args('id', { type: () => String }) id: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<GetEventByIdResult> {
    const event = await ctx.loaders.getEventDataLoader(currentUser).load(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  @Query()
  async events(
    @Args('filters', new ZodPipe(EventPaginationFiltersSchema)) filters: EventPaginationFilters,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GetMyEventsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters.page ?? 1;

    const { events, totalCount } = await this.getEventsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber,
      pageSize,
      ignorePastEvents: false,
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

  @Public()
  @OptionalAuth()
  @Query()
  async eventInvitePreview(
    @Args('token', new ZodPipe(EventInviteTokenSchema)) token: string,
    @GqlOptionalUser() currentUser?: ICurrentUser,
  ): Promise<EventInvitePreviewResult> {
    const { preview } = await this.getEventInvitePreviewUseCase.execute({ token, currentUser });
    return eventMapper.toGqlEventInvitePreview(preview);
  }
}
