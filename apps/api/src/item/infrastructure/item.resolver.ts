import { Logger } from '@nestjs/common'
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'

import { Item, User } from '../../gql/generated-types'

@Resolver('Item')
export class ItemResolver {
  private readonly logger = new Logger(ItemResolver.name)

  @ResolveField()
  async takerUser(@Parent() item: Item, @Context() ctx: GraphQLContext): Promise<User | undefined> {
    if (!item.takenById) return undefined
    const takerUser = await ctx.loaders.user.load(item.takenById as UserId)
    if (!takerUser) {
      this.logger.warn(`Taker user not found for item ${item.id}`, { itemId: item.id, takenById: item.takenById })
      return undefined
    }
    return takerUser
  }
}
