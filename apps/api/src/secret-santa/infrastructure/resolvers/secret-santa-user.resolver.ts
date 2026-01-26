import { NotFoundException } from '@nestjs/common'
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { EventAttendee, SecretSantaUser } from '../../../gql/generated-types'

@Resolver('SecretSantaUser')
export class SecretSantaUserResolver {
  @ResolveField()
  async attendee(@Parent() secretSantaUser: SecretSantaUser, @Context() ctx: GraphQLContext): Promise<EventAttendee> {
    const attendee = await ctx.loaders.eventAttendee.load(secretSantaUser.attendeeId)
    if (!attendee) {
      throw new NotFoundException(`Attendee with id ${secretSantaUser.attendeeId} not found`)
    }
    return attendee
  }

  @ResolveField()
  async exclusions(
    @Parent() secretSantaUser: SecretSantaUser,
    @Context() ctx: GraphQLContext,
  ): Promise<SecretSantaUser[]> {
    const exclusions = await ctx.loaders.secretSantaUser.loadMany(secretSantaUser.exclusionIds)
    return exclusions.filter((exclusion): exclusion is SecretSantaUser => exclusion !== null)
  }
}
