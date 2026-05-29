import { NotFoundException } from '@nestjs/common'
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { Event, EventAttendee, SecretSanta, SecretSantaUser } from '../../../gql/generated-types'

@Resolver('SecretSanta')
export class SecretSantaFieldResolver {
  @ResolveField()
  async event(@Parent() secretSanta: SecretSanta, @Context() ctx: GraphQLContext): Promise<Event> {
    const event = await ctx.loaders.event.load(secretSanta.eventId)
    if (!event) {
      throw new NotFoundException(`Event with id ${secretSanta.eventId} of secret santa ${secretSanta.id} not found`)
    }
    return event
  }
}

@Resolver('SecretSantaUser')
export class SecretSantaUserFieldResolver {
  @ResolveField()
  async attendee(@Parent() user: SecretSantaUser, @Context() ctx: GraphQLContext): Promise<EventAttendee> {
    const attendee = await ctx.loaders.eventAttendee.load(user.attendeeId)
    if (!attendee) {
      throw new NotFoundException(`Attendee with id ${user.attendeeId} of secret santa user ${user.id} not found`)
    }
    return attendee
  }
}
