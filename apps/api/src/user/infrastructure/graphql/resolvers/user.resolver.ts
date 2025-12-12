import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ICurrentUser, UserId, UserSocialId } from '@wishlist/common'

import { GqlAuthGuard, GqlCurrentUser } from '../../../../graphql'
import {
  CreateUserCommand,
  GetClosestFriendsQuery,
  GetUserByIdQuery,
  GetUsersByCriteriaQuery,
  LinkUserToGoogleCommand,
  RemoveUserPictureCommand,
  UnlinkUserSocialCommand,
  UpdateUserCommand,
  UpdateUserPasswordCommand,
  UpdateUserPictureFromSocialCommand,
} from '../../../domain'
import { userGraphQLMapper } from '../mappers'
import {
  ChangeUserPasswordInput,
  LinkUserToGoogleInput,
  MiniUserObject,
  RegisterUserInput,
  UpdateUserProfileInput,
  UserObject,
  UserSocialObject,
} from '../types'

@Resolver(() => UserObject)
export class UserResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => UserObject, { name: 'me', description: 'Get current user information' })
  @UseGuards(GqlAuthGuard)
  async me(@GqlCurrentUser('id') currentUserId: UserId): Promise<UserObject> {
    const user = await this.queryBus.execute(new GetUserByIdQuery({ userId: currentUserId }))
    return userGraphQLMapper.toUserObject(user)
  }

  @Query(() => [MiniUserObject], { name: 'searchUsers', description: 'Search users by keyword' })
  @UseGuards(GqlAuthGuard)
  async searchUsers(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('keyword') keyword: string,
  ): Promise<MiniUserObject[]> {
    const users = await this.queryBus.execute(
      new GetUsersByCriteriaQuery({
        currentUser,
        criteria: keyword,
      }),
    )
    return users.map(userGraphQLMapper.toMiniUserObject)
  }

  @Query(() => [MiniUserObject], { name: 'closestFriends', description: 'Get closest friends' })
  @UseGuards(GqlAuthGuard)
  async closestFriends(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<MiniUserObject[]> {
    const friends = await this.queryBus.execute(new GetClosestFriendsQuery({ userId: currentUserId, limit }))
    return friends.map(userGraphQLMapper.toMiniUserObject)
  }

  @Mutation(() => MiniUserObject, { name: 'registerUser', description: 'Register a new user' })
  async registerUser(
    @Args('input') input: RegisterUserInput,
    @Context() context: { req: { ip: string } },
  ): Promise<MiniUserObject> {
    const user = await this.commandBus.execute(
      new CreateUserCommand({
        ip: context.req.ip,
        newUser: {
          email: input.email.toLowerCase(),
          password: input.password,
          firstname: input.firstname,
          lastname: input.lastname,
        },
      }),
    )
    return userGraphQLMapper.toMiniUserObject(user)
  }

  @Mutation(() => Boolean, { name: 'updateUserProfile', description: 'Update user profile' })
  @UseGuards(GqlAuthGuard)
  async updateUserProfile(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('input') input: UpdateUserProfileInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateUserCommand({
        userId: currentUserId,
        updateUser: {
          firstname: input.firstname,
          lastname: input.lastname,
          birthday: input.birthday ? new Date(input.birthday) : undefined,
        },
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'changePassword', description: 'Change user password' })
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('input') input: ChangeUserPasswordInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateUserPasswordCommand({
        userId: currentUserId,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      }),
    )
    return true
  }

  @Mutation(() => UserSocialObject, { name: 'linkGoogleAccount', description: 'Link Google account to user' })
  @UseGuards(GqlAuthGuard)
  async linkGoogleAccount(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('input') input: LinkUserToGoogleInput,
  ): Promise<UserSocialObject> {
    const social = await this.commandBus.execute(
      new LinkUserToGoogleCommand({ code: input.code, userId: currentUserId }),
    )
    return userGraphQLMapper.toUserSocialObject(social)
  }

  @Mutation(() => Boolean, { name: 'unlinkSocialAccount', description: 'Unlink social account from user' })
  @UseGuards(GqlAuthGuard)
  async unlinkSocialAccount(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('socialId') socialId: string,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UnlinkUserSocialCommand({ userId: currentUserId, socialId: socialId as UserSocialId }),
    )
    return true
  }

  @Mutation(() => Boolean, {
    name: 'updatePictureFromSocial',
    description: 'Update user picture from linked social account',
  })
  @UseGuards(GqlAuthGuard)
  async updatePictureFromSocial(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('socialId') socialId: string,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateUserPictureFromSocialCommand({ userId: currentUserId, socialId: socialId as UserSocialId }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'removeUserPicture', description: 'Remove user profile picture' })
  @UseGuards(GqlAuthGuard)
  async removeUserPicture(@GqlCurrentUser('id') currentUserId: UserId): Promise<boolean> {
    await this.commandBus.execute(new RemoveUserPictureCommand({ userId: currentUserId }))
    return true
  }
}
