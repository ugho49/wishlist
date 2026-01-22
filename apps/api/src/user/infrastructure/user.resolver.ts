import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, Public } from '@wishlist/api/auth'
import { GqlVoidOutput, GraphQLContext, VoidResult, ZodPipe } from '@wishlist/api/core'
import { UserId, UserSocialId } from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import { CreateUserUseCase } from '../application/command/create-user.use-case'
import { LinkUserToGoogleUseCase } from '../application/command/link-user-to-google.use-case'
import { UnlinkUserSocialUseCase } from '../application/command/unlink-user-social.use-case'
import { UpdateUserUseCase } from '../application/command/update-user.use-case'
import {
  GetCurrentUserResult,
  GqlUser,
  GqlUserSocial,
  LinkUserToGoogleInput,
  LinkUserToGoogleResult,
  RegisterUserInput,
  RegisterUserResult,
  UpdateUserInput,
  UpdateUserResult,
} from './user.dto'
import { LinkUserToGoogleInputSchema, RegisterUserInputSchema, UpdateUserInputSchema } from './user.schema'

@Resolver(() => GqlUser)
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly linkUserToGoogleUseCase: LinkUserToGoogleUseCase,
    private readonly unlinkUserSocialUseCase: UnlinkUserSocialUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Query(() => GetCurrentUserResult)
  async getCurrentUser(@GqlCurrentUser('id') currentUserId: UserId, @Context() ctx: GraphQLContext): Promise<GqlUser> {
    const user = await ctx.loaders.user.load(currentUserId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  @ResolveField(() => [GqlUserSocial], { nullable: true })
  socials(
    @Parent() user: GqlUser,
    @Context() ctx: GraphQLContext,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GqlUserSocial[] | null> {
    if (user.id !== currentUserId) return Promise.resolve(null)
    return ctx.loaders.userSocialsByUser.load(user.id)
  }

  @Public()
  @Mutation(() => RegisterUserResult)
  async registerUser(
    @Args('input', new ZodPipe(RegisterUserInputSchema)) input: RegisterUserInput,
    @RealIP() ip: string,
    @Context() ctx: GraphQLContext,
  ): Promise<GqlUser> {
    const user = await this.createUserUseCase.execute({
      ip,
      newUser: {
        email: input.email,
        password: input.password,
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday,
      },
    })

    const loadedUser = await ctx.loaders.user.load(user.id)

    if (!loadedUser) {
      throw new Error('Failed to load user')
    }

    return loadedUser
  }

  @Mutation(() => LinkUserToGoogleResult)
  async linkCurrentUserlWithGoogle(
    @Args('input', new ZodPipe(LinkUserToGoogleInputSchema)) input: LinkUserToGoogleInput,
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<GqlUserSocial> {
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

  @Mutation(() => VoidResult)
  async unlinkCurrentUserSocial(
    @Args('socialId', { type: () => String }) id: UserSocialId,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GqlVoidOutput> {
    await this.unlinkUserSocialUseCase.execute({ userId: currentUserId, socialId: id })
    return { success: true }
  }

  @Mutation(() => UpdateUserResult)
  async updateUserProfile(
    @Args('input', new ZodPipe(UpdateUserInputSchema)) input: UpdateUserInput,
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<GqlUser> {
    await this.updateUserUseCase.execute({
      userId: currentUserId,
      updateUser: {
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday,
      },
    })

    const loadedUser = await ctx.loaders.user.load(currentUserId)
    if (!loadedUser) {
      throw new Error('Failed to load user')
    }
    return loadedUser
  }
}
