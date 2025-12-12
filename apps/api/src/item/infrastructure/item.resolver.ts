import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContextEnum } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { UserOutput } from '../../user/infrastructure/user.dto'
import { ItemOutput } from './item.dto'

@Resolver(() => ItemOutput)
export class ItemResolver {
  @ResolveField(() => UserOutput, { nullable: true })
  takerUser(
    @Parent() parent: ItemOutput,
    @Context(GraphQLContextEnum.USER_DATA_LOADER) dataLoader: DataLoader<UserId, UserOutput>,
  ): Promise<UserOutput | undefined> {
    if (!parent.takenById) return Promise.resolve(undefined)
    return dataLoader.load(parent.takenById)
  }
}
