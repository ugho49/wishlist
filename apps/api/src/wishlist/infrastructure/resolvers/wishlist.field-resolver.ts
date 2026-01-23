import { NotFoundException } from '@nestjs/common'
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { Event, User, Wishlist } from '../../../gql/generated-types'

@Resolver('Wishlist')
export class WishlistFieldResolver {
  @ResolveField()
  async owner(@Parent() wishlist: Wishlist, @Context() ctx: GraphQLContext): Promise<User> {
    const owner = await ctx.loaders.user.load(wishlist.ownerId)
    if (!owner) {
      throw new NotFoundException(`Owner with id ${wishlist.ownerId} of wishlist ${wishlist.id} not found`)
    }
    return owner
  }

  @ResolveField()
  async coOwner(@Parent() wishlist: Wishlist, @Context() ctx: GraphQLContext): Promise<User | undefined> {
    if (!wishlist.coOwnerId) return Promise.resolve(undefined)
    const coOwner = await ctx.loaders.user.load(wishlist.coOwnerId)
    if (!coOwner) {
      throw new NotFoundException(`Co-owner with id ${wishlist.coOwnerId} of wishlist ${wishlist.id} not found`)
    }
    return coOwner
  }

  @ResolveField()
  async events(@Parent() wishlist: Wishlist, @Context() ctx: GraphQLContext): Promise<Event[]> {
    if (wishlist.eventIds.length === 0) return []
    const events = await ctx.loaders.event.loadMany(wishlist.eventIds)
    // Filter out null values (events user doesn't have access to)
    return events.filter((event): event is Event => event !== null)
  }
}
