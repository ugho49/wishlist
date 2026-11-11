import type { ICurrentUser } from '@wishlist/common';

import { type AttendeeId, createPagedResponse, type EventId } from '@wishlist/common';
import { Args, Loader, Mutation, Query, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { EventsById } from '../../../event/infrastructure/event.dataloader';
import {
  type AdminDeleteEventAttendeeResult,
  type AdminDeleteEventResult,
  type AdminEventPaginationFilters,
  type AdminEventsStatsResult,
  type AdminGetEventByIdResult,
  type AdminGetEventsResult,
  type AdminUpdateEventAttendeeRoleResult,
  type AdminUpdateEventResult,
  AttendeeRole as GqlAttendeeRole,
  type UpdateEventInput,
} from '../../../gql/generated-types';
import { DeleteAttendeeUseCase } from '../../application/command/delete-attendee.use-case';
import { DeleteEventUseCase } from '../../application/command/delete-event.use-case';
import { UpdateAttendeeRoleUseCase } from '../../application/command/update-attendee-role.use-case';
import { UpdateEventUseCase } from '../../application/command/update-event.use-case';
import { GetAdminEventsStatsUseCase } from '../../application/query/get-admin-events-stats.use-case';
import { GetEventsUseCase } from '../../application/query/get-events.use-case';
import { GetEventsForUserUseCase } from '../../application/query/get-events-for-user.use-case';
import { eventMapper } from '../event.mapper';
import {
  AdminEventPaginationFiltersSchema,
  AttendeeIdSchema,
  EventIdSchema,
  GqlAttendeeRoleSchema,
  toDomainAttendeeRole,
  UpdateEventInputSchema,
} from '../event.schema';

@IsAdmin()
@Resolver()
export class EventAdminResolver {
  constructor(
    private readonly getEventsUseCase: GetEventsUseCase,
    private readonly getAdminEventsStatsUseCase: GetAdminEventsStatsUseCase,
    private readonly getEventsForUserUseCase: GetEventsForUserUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly deleteAttendeeUseCase: DeleteAttendeeUseCase,
    private readonly updateAttendeeRoleUseCase: UpdateAttendeeRoleUseCase,
  ) {}
  @Query()
  async adminEvent(
    @Args('id', EventIdSchema) id: EventId,
    @Loader() eventsLoader: Loader<EventsById>,
  ): Promise<AdminGetEventByIdResult> {
    // canView returns true for admins, so the dataloader resolves any event.
    const event = await eventsLoader.load(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  @Query()
  async adminEvents(
    @Args('filters', AdminEventPaginationFiltersSchema) filters: AdminEventPaginationFilters,
  ): Promise<AdminGetEventsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters.page ?? 1;

    const { events, totalCount: totalEventsCount } = filters.userId
      ? await this.getEventsForUserUseCase.execute({
          userId: filters.userId,
          pageNumber,
          pageSize,
          ignorePastEvents: false,
          criteria: filters.criteria ?? undefined,
        })
      : await this.getEventsUseCase.execute({
          pageNumber,
          pageSize,
          criteria: filters.criteria ?? undefined,
        });

    const pagedResponse = createPagedResponse({
      resources: events.map(event => eventMapper.toGqlEvent(event)),
      options: {
        pageSize,
        totalElements: totalEventsCount,
        pageNumber,
      },
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

  @Query()
  async adminEventsStats(): Promise<AdminEventsStatsResult> {
    const stats = await this.getAdminEventsStatsUseCase.execute();
    return {
      __typename: 'AdminEventsStats',
      totalCount: stats.totalCount,
      upcomingCount: stats.upcomingCount,
      pastCount: stats.pastCount,
      createdByMonth: stats.createdByMonth.map(point => ({
        __typename: 'AdminMonthlyCount' as const,
        month: point.month,
        count: point.count,
      })),
    };
  }

  @Mutation()
  async adminUpdateEvent(
    @Args('id', EventIdSchema) id: EventId,
    @Args('input', UpdateEventInputSchema) input: UpdateEventInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminUpdateEventResult> {
    await this.updateEventUseCase.execute({
      currentUser,
      eventId: id,
      updateEvent: {
        title: input.title,
        description: input.description ?? undefined,
        icon: input.icon ?? undefined,
        eventDate: new Date(input.eventDate),
      },
    });

    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminDeleteEvent(
    @Args('id', EventIdSchema) id: EventId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteEventResult> {
    await this.deleteEventUseCase.execute({ currentUser, eventId: id });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminDeleteEventAttendee(
    @Args('eventId', EventIdSchema) eventId: EventId,
    @Args('attendeeId', AttendeeIdSchema) attendeeId: AttendeeId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteEventAttendeeResult> {
    await this.deleteAttendeeUseCase.execute({ currentUser, eventId, attendeeId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminUpdateEventAttendeeRole(
    @Args('eventId', EventIdSchema) eventId: EventId,
    @Args('attendeeId', AttendeeIdSchema) attendeeId: AttendeeId,
    @Args('role', GqlAttendeeRoleSchema) role: GqlAttendeeRole,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminUpdateEventAttendeeRoleResult> {
    await this.updateAttendeeRoleUseCase.execute({
      currentUser,
      eventId,
      attendeeId,
      role: toDomainAttendeeRole(role),
    });
    return { __typename: 'VoidOutput', success: true };
  }
}
