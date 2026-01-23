import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, Public } from '@wishlist/api/auth'
import { GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { UserId, UserSocialId } from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import {
  LinkUserToGoogleInput,
  LinkUserToGoogleResult,
  RegisterUserInput,
  RegisterUserResult,
  UnlinkCurrentUserSocialResult,
  UpdateUserProfileInput,
  UpdateUserProfileResult,
  User,
} from '../../../gql/generated-types'
import { CreateUserUseCase } from '../../application/command/create-user.use-case'
import { LinkUserToGoogleUseCase } from '../../application/command/link-user-to-google.use-case'
import { UnlinkUserSocialUseCase } from '../../application/command/unlink-user-social.use-case'
import { UpdateUserUseCase } from '../../application/command/update-user.use-case'
import { LinkUserToGoogleInputSchema, RegisterUserInputSchema, UpdateUserProfileInputSchema } from '../user.schema'

@Resolver()
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly linkUserToGoogleUseCase: LinkUserToGoogleUseCase,
    private readonly unlinkUserSocialUseCase: UnlinkUserSocialUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Query()
  async getCurrentUser(@GqlCurrentUser('id') currentUserId: UserId, @Context() ctx: GraphQLContext): Promise<User> {
    const user = await ctx.loaders.user.load(currentUserId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  @Public()
  @Mutation()
  async registerUser(
    @Args('input', new ZodPipe(RegisterUserInputSchema)) input: RegisterUserInput,
    @RealIP() ip: string,
    @Context() ctx: GraphQLContext,
  ): Promise<RegisterUserResult> {
    const user = await this.createUserUseCase.execute({
      ip,
      newUser: {
        email: input.email,
        password: input.password,
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
      },
    })

    const loadedUser = await ctx.loaders.user.load(user.id)

    if (!loadedUser) {
      throw new Error('Failed to load user')
    }

    return loadedUser
  }

  @Mutation()
  async linkCurrentUserlWithGoogle(
    @Args('input', new ZodPipe(LinkUserToGoogleInputSchema)) input: LinkUserToGoogleInput,
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<LinkUserToGoogleResult> {
    const userSocial = await this.linkUserToGoogleUseCase.execute({
      code: input.code,
      userId: currentUserId,
    })

    const loadedUserSocial = await ctx.loaders.userSocial.load(userSocial.id)
    if (!loadedUserSocial) {
      throw new Error('Failed to load user social')
    }
    return loadedUserSocial
  }

  @Mutation()
  async unlinkCurrentUserSocial(
    @Args('socialId', { type: () => String }) id: UserSocialId,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UnlinkCurrentUserSocialResult> {
    await this.unlinkUserSocialUseCase.execute({ userId: currentUserId, socialId: id })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async updateUserProfile(
    @Args('input', new ZodPipe(UpdateUserProfileInputSchema)) input: UpdateUserProfileInput,
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<UpdateUserProfileResult> {
    await this.updateUserUseCase.execute({
      userId: currentUserId,
      updateUser: {
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
      },
    })

    const loadedUser = await ctx.loaders.user.load(currentUserId)
    if (!loadedUser) {
      throw new Error('Failed to load user')
    }
    return loadedUser
  }
}
