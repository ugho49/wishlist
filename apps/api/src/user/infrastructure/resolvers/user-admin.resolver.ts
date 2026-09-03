import type { ICurrentUser } from '@wishlist/common';

import { NotFoundException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { createPagedResponse, type UserId, type UserSessionId } from '@wishlist/common';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import {
  type AdminDeleteUserResult,
  type AdminGetAllUsersPaginationFilters,
  type AdminGetAllUsersResult,
  type AdminGetUserByIdResult,
  type AdminRemoveUserPictureResult,
  type AdminRevokeAllUserSessionsResult,
  type AdminRevokeUserSessionResult,
  type AdminUpdateUserProfileInput,
  type AdminUpdateUserProfileResult,
} from '../../../gql/generated-types';
import { AdminRevokeAllUserSessionsUseCase } from '../../application/command/admin-revoke-all-user-sessions.use-case';
import { AdminRevokeUserSessionUseCase } from '../../application/command/admin-revoke-user-session.use-case';
import { DeleteUserUseCase } from '../../application/command/delete-user.use-case';
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case';
import { UpdateUserFullUseCase } from '../../application/command/update-user-full.use-case';
import { GetUsersPaginatedUseCase } from '../../application/query/get-users-paginated.use-case';
import { userMapper } from '../user.mapper';
import { UserIdSchema, UserSessionIdSchema } from '../user.schema';
import { AdminGetAllUsersPaginationFiltersSchema, AdminUpdateUserProfileInputSchema } from '../user-admin.schema';

@IsAdmin()
@Resolver()
export class UserAdminResolver {
  constructor(
    private readonly getUsersPaginatedUseCase: GetUsersPaginatedUseCase,
    private readonly updateUserFullUseCase: UpdateUserFullUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
    private readonly adminRevokeUserSessionUseCase: AdminRevokeUserSessionUseCase,
    private readonly adminRevokeAllUserSessionsUseCase: AdminRevokeAllUserSessionsUseCase,
  ) {}

  @Query()
  async adminUser(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<AdminGetUserByIdResult> {
    const result = await ctx.loaders.userFull.load(userId);

    if (!result) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return result;
  }

  @Query()
  async adminUsers(
    @Args('input', new ZodPipe(AdminGetAllUsersPaginationFiltersSchema)) input: AdminGetAllUsersPaginationFilters,
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

  @Mutation()
  async adminUpdateUserProfile(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @Args('input', new ZodPipe(AdminUpdateUserProfileInputSchema))
    input: AdminUpdateUserProfileInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
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
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteUserResult> {
    await this.deleteUserUseCase.execute({ userId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRemoveUserPicture(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
  ): Promise<AdminRemoveUserPictureResult> {
    await this.removeUserPictureUseCase.execute({ userId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRevokeUserSession(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @Args('sessionId', new ZodPipe(UserSessionIdSchema)) sessionId: UserSessionId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminRevokeUserSessionResult> {
    await this.adminRevokeUserSessionUseCase.execute({ currentUser, userId, sessionId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRevokeAllUserSessions(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminRevokeAllUserSessionsResult> {
    await this.adminRevokeAllUserSessionsUseCase.execute({ currentUser, userId });
    return { __typename: 'VoidOutput', success: true };
  }
}
