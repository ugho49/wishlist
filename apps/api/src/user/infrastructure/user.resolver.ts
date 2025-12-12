import { Context, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContextEnum } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { UserOutput } from './user.dto'

@Resolver(() => UserOutput)
export class UserResolver {
  @Query(() => UserOutput)
  getCurrentUser(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context(GraphQLContextEnum.USER_DATA_LOADER) userDataLoader: DataLoader<UserId, UserOutput>,
  ): Promise<UserOutput> {
    return userDataLoader.load(currentUserId)
  }
}
