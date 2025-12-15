import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContextEnum } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { UserOutput } from '../../user/infrastructure/user.dto'
import { EventAttendeeOutput } from './event.dto'

@Resolver(() => EventAttendeeOutput)
export class EventAttendeeResolver {
  @ResolveField(() => UserOutput, { nullable: true })
  user(
    @Parent() parent: EventAttendeeOutput,
    @Context(GraphQLContextEnum.USER_DATA_LOADER) dataLoader: DataLoader<UserId, UserOutput | null>,
  ): Promise<UserOutput | null> {
    if (!parent.userId) return Promise.resolve(null)
    return dataLoader.load(parent.userId)
  }
}
