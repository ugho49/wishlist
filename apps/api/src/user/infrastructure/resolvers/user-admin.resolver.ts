import type { ICurrentUser } from '@wishlist/common';

import { createPagedResponse, type UserId, type UserSessionId } from '@wishlist/common';
import { Args, Loader, Mutation, Query, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import {
  type AdminDeleteUserResult,
  type AdminGetAllUsersPaginationFilters,
  type AdminGetAllUsersResult,
  type AdminGetUserByIdResult,
  type AdminRemoveUserPictureResult,
  type AdminRevokeAllUserSessionsResult,
  type AdminRevokeUserSessionResult,
  type AdminSetUserAdminResult,
  type AdminUpdateUserProfileInput,
  type AdminUpdateUserProfileResult,
  type AdminUsersStatsResult,
} from '../../../gql/generated-types';
import { UsersFullById } from '../../../user/infrastructure/user.dataloader';
import { AdminRevokeAllUserSessionsUseCase } from '../../application/command/admin-revoke-all-user-sessions.use-case';
import { AdminRevokeUserSessionUseCase } from '../../application/command/admin-revoke-user-session.use-case';
import { DeleteUserUseCase } from '../../application/command/delete-user.use-case';
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case';
import { SetUserAdminUseCase } from '../../application/command/set-user-admin.use-case';
import { UpdateUserFullUseCase } from '../../application/command/update-user-full.use-case';
import { GetAdminUsersStatsUseCase } from '../../application/query/get-admin-users-stats.use-case';
import { GetUsersPaginatedUseCase } from '../../application/query/get-users-paginated.use-case';
import { userMapper } from '../user.mapper';
import { UserIdSchema, UserSessionIdSchema } from '../user.schema';
import {
  AdminGetAllUsersPaginationFiltersSchema,
  AdminSetUserAdminIsAdminSchema,
  AdminUpdateUserProfileInputSchema,
} from '../user-admin.schema';

@IsAdmin()
@Resolver()
export class UserAdminResolver {
  constructor(
    private readonly getUsersPaginatedUseCase: GetUsersPaginatedUseCase,
    private readonly getAdminUsersStatsUseCase: GetAdminUsersStatsUseCase,
    private readonly updateUserFullUseCase: UpdateUserFullUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
    private readonly adminRevokeUserSessionUseCase: AdminRevokeUserSessionUseCase,
    private readonly adminRevokeAllUserSessionsUseCase: AdminRevokeAllUserSessionsUseCase,
    private readonly setUserAdminUseCase: SetUserAdminUseCase,
  ) {}
  @Query()
  async adminUser(
    @Args('userId', UserIdSchema) userId: UserId,
    @Loader() usersFullLoader: Loader<UsersFullById>,
  ): Promise<AdminGetUserByIdResult> {
    const result = await usersFullLoader.load(userId);

    if (!result) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return result;
  }

  @Query()
  async adminUsers(
    @Args('input', AdminGetAllUsersPaginationFiltersSchema) input: AdminGetAllUsersPaginationFilters,
  ): Promise<AdminGetAllUsersResult> {
    const pageSize = input.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = input.page ?? 1;

    const { users, totalCount } = await this.getUsersPaginatedUseCase.execute({
      criteria: input.criteria ?? undefined,
      pageNumber,
      pageSize,
    });

    const pagedResponse = createPagedResponse({
      resources: users.map(user => userMapper.toGqlUserFull(user)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });

    return {
      __typename: 'AdminGetAllUsers',
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
  async adminUsersStats(): Promise<AdminUsersStatsResult> {
    const stats = await this.getAdminUsersStatsUseCase.execute();
    return {
      __typename: 'AdminUsersStats',
      totalCount: stats.totalCount,
      enabledCount: stats.enabledCount,
      adminCount: stats.adminCount,
      createdByMonth: stats.createdByMonth.map(point => ({
        __typename: 'AdminMonthlyCount' as const,
        month: point.month,
        count: point.count,
      })),
    };
  }

  @Mutation()
  async adminUpdateUserProfile(
    @Args('userId', UserIdSchema) userId: UserId,
    @Args('input', AdminUpdateUserProfileInputSchema)
    input: AdminUpdateUserProfileInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminUpdateUserProfileResult> {
    await this.updateUserFullUseCase.execute({
      userId,
      currentUser,
      updateUser: {
        email: input.email ?? undefined,
        newPassword: input.newPassword ?? undefined,
        firstname: input.firstname ?? undefined,
        lastname: input.lastname ?? undefined,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
        isEnabled: input.isEnabled ?? undefined,
      },
    });

    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminDeleteUser(
    @Args('userId', UserIdSchema) userId: UserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteUserResult> {
    await this.deleteUserUseCase.execute({ userId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRemoveUserPicture(@Args('userId', UserIdSchema) userId: UserId): Promise<AdminRemoveUserPictureResult> {
    await this.removeUserPictureUseCase.execute({ userId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRevokeUserSession(
    @Args('userId', UserIdSchema) userId: UserId,
    @Args('sessionId', UserSessionIdSchema) sessionId: UserSessionId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminRevokeUserSessionResult> {
    await this.adminRevokeUserSessionUseCase.execute({ currentUser, userId, sessionId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRevokeAllUserSessions(
    @Args('userId', UserIdSchema) userId: UserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminRevokeAllUserSessionsResult> {
    await this.adminRevokeAllUserSessionsUseCase.execute({ currentUser, userId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminSetUserAdmin(
    @Args('userId', UserIdSchema) userId: UserId,
    @Args('isAdmin', AdminSetUserAdminIsAdminSchema) isAdmin: boolean,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminSetUserAdminResult> {
    await this.setUserAdminUseCase.execute({ currentUser, userId, isAdmin });
    return { __typename: 'VoidOutput', success: true };
  }
}
