import { NotFoundException } from '@nestjs/common'
import { Args, Context, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { EventId, UserId } from '@wishlist/common'

import { EventPaginationFilters, GetEventByIdResult, GetMyEventsResult } from '../../../gql/generated-types'
import { GetEventsByUserUseCase } from '../../application/query/get-events-by-user.use-case'
import { eventMapper } from '../event.mapper'
import { EventPaginationFiltersSchema } from '../event.schema'

@Resolver()
export class EventResolver {
  constructor(private readonly getEventsByUserUseCase: GetEventsByUserUseCase) {}

  @Query()
  async getEventById(
    @Args('id', { type: () => String }) id: EventId,
    @Context() ctx: GraphQLContext,
  ): Promise<GetEventByIdResult> {
    const event = await ctx.loaders.event.load(id)
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`)
    }
    return event
  }

  @Query()
  async getMyEvents(
    @Args('filters', new ZodPipe(EventPaginationFiltersSchema)) filters: EventPaginationFilters,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GetMyEventsResult> {
    const result = await this.getEventsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber: filters.page ?? 1,
      pageSize: filters.limit ?? 10,
      ignorePastEvents: false,
    })

    return {
      __typename: 'GetEventsPagedResponse',
      data: result.resources.map(eventMapper.toGqlEvent),
      pagination: {
        __typename: 'Pagination',
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }
}
