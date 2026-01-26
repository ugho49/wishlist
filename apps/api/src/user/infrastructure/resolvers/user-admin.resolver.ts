import type { ICurrentUser } from '@wishlist/common'

import { NotFoundException } from '@nestjs/common'
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, IsAdmin } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER, GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { createPagedResponse, UserId } from '@wishlist/common'

import {
  AdminDeleteUserResult,
  AdminGetAllUsersPaginationFilters,
  AdminGetAllUsersResult,
  AdminGetUserByIdResult,
  AdminRemoveUserPictureResult,
  AdminUpdateUserProfileInput,
  AdminUpdateUserProfileResult,
  UserFull,
  UserSocial,
} from '../../../gql/generated-types'
import { DeleteUserUseCase } from '../../application/command/delete-user.use-case'
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case'
import { UpdateUserFullUseCase } from '../../application/command/update-user-full.use-case'
import { GetUsersPaginatedUseCase } from '../../application/query/get-users-paginated.use-case'
import { userMapper } from '../user.mapper'
import { UserIdSchema } from '../user.schema'
import { AdminGetAllUsersPaginationFiltersSchema, AdminUpdateUserProfileInputSchema } from '../user-admin.schema'

@IsAdmin()
@Resolver('UserFull')
export class UserAdminResolver {
  constructor(
    private readonly getUsersPaginatedUseCase: GetUsersPaginatedUseCase,
    private readonly updateUserFullUseCase: UpdateUserFullUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
  ) {}

  @ResolveField()
  socials(@Parent() user: UserFull, @Context() ctx: GraphQLContext): Promise<UserSocial[]> {
    return ctx.loaders.userSocialsByUser.load(user.id)
  }

  @Query()
  async adminGetUserById(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<AdminGetUserByIdResult> {
    const result = await ctx.loaders.userFull.load(userId)

    if (!result) {
      throw new NotFoundException(`User with id ${userId} not found`)
    }

    return result
  }

  @Query()
  async adminGetAllUsers(
    @Args('input', new ZodPipe(AdminGetAllUsersPaginationFiltersSchema)) input: AdminGetAllUsersPaginationFilters,
  ): Promise<AdminGetAllUsersResult> {
    const pageSize = input.limit ?? DEFAULT_RESULT_NUMBER
    const pageNumber = input.page ?? 1

    const { users, totalCount } = await this.getUsersPaginatedUseCase.execute({
      criteria: input.criteria ?? undefined,
      pageNumber,
      pageSize,
    })

    const pagedResponse = createPagedResponse({
      resources: users.map(user => userMapper.toGqlUserFull(user)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })

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
    }
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
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async adminDeleteUser(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteUserResult> {
    await this.deleteUserUseCase.execute({ userId, currentUser })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async adminRemoveUserPicture(
    @Args('userId', new ZodPipe(UserIdSchema)) userId: UserId,
  ): Promise<AdminRemoveUserPictureResult> {
    await this.removeUserPictureUseCase.execute({ userId })
    return { __typename: 'VoidOutput', success: true }
  }
}
