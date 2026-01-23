import type { ICurrentUser } from '@wishlist/common'

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, IsAdmin } from '@wishlist/api/auth'
import { ZodPipe } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'

import {
  AdminDeleteUserResult,
  AdminGetAllUsersInput,
  AdminGetAllUsersResult,
  AdminGetUserByIdResult,
  AdminRemoveUserPictureResult,
  AdminUpdateUserProfileInput,
  AdminUpdateUserProfileResult,
  PagedUsers,
  Pagination,
  User,
  UserWithoutSocials,
} from '../../../gql/generated-types'
import { DeleteUserUseCase } from '../../application/command/delete-user.use-case'
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case'
import { UpdateUserFullUseCase } from '../../application/command/update-user-full.use-case'
import { GetUserByIdUseCase } from '../../application/query/get-user-by-id.use-case'
import { GetUsersPaginatedUseCase } from '../../application/query/get-users-paginated.use-case'
import { AdminGetAllUsersInputSchema, AdminUpdateUserProfileInputSchema, UserIdSchema } from '../user-admin.schema'

@IsAdmin()
@Resolver()
export class UserAdminResolver {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersPaginatedUseCase: GetUsersPaginatedUseCase,
    private readonly updateUserFullUseCase: UpdateUserFullUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
  ) {}

  @Query()
  async adminGetUserById(@Args('userId', new ZodPipe(UserIdSchema)) userId: UserId): Promise<AdminGetUserByIdResult> {
    const result = await this.getUserByIdUseCase.execute({ userId })

    const user: User = {
      __typename: 'User',
      id: result.id,
      firstName: result.firstname,
      lastName: result.lastname,
      email: result.email,
      pictureUrl: result.picture_url ?? null,
      birthday: result.birthday ?? null,
      isEnabled: result.is_enabled,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      socials: result.social.map(social => ({
        __typename: 'UserSocial',
        id: social.id,
        email: social.email,
        name: social.name ?? null,
        socialType: social.social_type,
        pictureUrl: social.picture_url ?? null,
        createdAt: social.created_at,
        updatedAt: social.updated_at,
      })),
    }

    return user
  }

  @Query()
  async adminGetAllUsers(
    @Args('input', new ZodPipe(AdminGetAllUsersInputSchema)) input?: AdminGetAllUsersInput,
  ): Promise<AdminGetAllUsersResult> {
    const result = await this.getUsersPaginatedUseCase.execute({
      pageNumber: input?.pageNumber ?? 1,
      criteria: input?.criteria ?? undefined,
    })

    const pagedUsers: PagedUsers = {
      __typename: 'PagedUsers',
      resources: result.resources.map(user => {
        const userWithoutSocials: UserWithoutSocials = {
          __typename: 'UserWithoutSocials',
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          pictureUrl: user.picture_url ?? null,
          birthday: user.birthday ?? null,
          admin: user.admin,
          isEnabled: user.is_enabled,
          lastConnectedAt: user.last_connected_at ?? null,
          lastIp: user.last_ip ?? null,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        }
        return userWithoutSocials
      }),
      pagination: {
        __typename: 'Pagination',
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      } satisfies Pagination,
    }

    return pagedUsers
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
