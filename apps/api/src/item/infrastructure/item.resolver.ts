import { Logger } from '@nestjs/common'
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { GqlUser } from '../../user/infrastructure/user.dto'
import { GqlItem } from './item.dto'

@Resolver(() => GqlItem)
export class ItemResolver {
  private readonly logger = new Logger(ItemResolver.name)

  @ResolveField(() => GqlUser, { nullable: true })
  async takerUser(@Parent() item: GqlItem, @Context() ctx: GraphQLContext): Promise<GqlUser | undefined> {
    if (!item.takenById) return undefined
    const takerUser = await ctx.loaders.user.load(item.takenById)
    if (!takerUser) {
      this.logger.warn(`Taker user not found for item ${item.id}`, { itemId: item.id, takenById: item.takenById })
      return undefined
    }
    return takerUser
  }
}
