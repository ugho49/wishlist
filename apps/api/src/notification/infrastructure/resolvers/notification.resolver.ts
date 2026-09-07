import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { createPagedResponse, type ICurrentUser, type UserNotificationId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { PaginationFiltersSchema } from '../../../core/graphql/common-type.schema';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import {
  type GetMyNotificationsResult,
  type GetUnreadNotificationCountResult,
  type MarkAllNotificationsReadResult,
  type MarkNotificationReadResult,
  type PaginationFilters,
} from '../../../gql/generated-types';
import { MarkAllNotificationsReadUseCase } from '../../application/command/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from '../../application/command/mark-notification-read.use-case';
import { GetMyNotificationsUseCase } from '../../application/query/get-my-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from '../../application/query/get-unread-notification-count.use-case';
import { notificationMapper } from '../notification.mapper';
import { UserNotificationIdSchema } from '../notification.schema';

@Resolver()
export class NotificationResolver {
  constructor(
    private readonly getMyNotificationsUseCase: GetMyNotificationsUseCase,
    private readonly getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  @Query()
  async myNotifications(
    @Args('filters', { nullable: true }, new ZodPipe(PaginationFiltersSchema.nullish()))
    filters: PaginationFilters | null | undefined,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetMyNotificationsResult> {
    const pageSize = filters?.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters?.page ?? 1;
    const { notifications, totalCount, unreadCount } = await this.getMyNotificationsUseCase.execute({
      currentUser,
      pageNumber,
      pageSize,
    });

    const pagedResponse = createPagedResponse({
      resources: notifications.map(notificationMapper.toGqlNotification),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });

    return {
      __typename: 'UserNotificationsPagedResponse',
      data: pagedResponse.resources,
      unreadCount,
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
  async unreadNotificationCount(
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetUnreadNotificationCountResult> {
    const { count } = await this.getUnreadNotificationCountUseCase.execute({ currentUser });
    return { __typename: 'UnreadNotificationCount', count };
  }

  @Mutation()
  async markNotificationRead(
    @Args('id', new ZodPipe(UserNotificationIdSchema)) id: UserNotificationId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<MarkNotificationReadResult> {
    await this.markNotificationReadUseCase.execute({ currentUser, notificationId: id });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async markAllNotificationsRead(@GqlCurrentUser() currentUser: ICurrentUser): Promise<MarkAllNotificationsReadResult> {
    await this.markAllNotificationsReadUseCase.execute({ currentUser });
    return { __typename: 'VoidOutput', success: true };
  }
}
