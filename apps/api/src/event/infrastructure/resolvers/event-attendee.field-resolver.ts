import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { type EventAttendee, type User } from '../../../gql/generated-types';

@Resolver('EventAttendee')
export class EventAttendeeFieldResolver {
  @ResolveField()
  user(@Parent() parent: EventAttendee, @Context() ctx: GraphQLContext): Promise<User | null> {
    if (!parent.userId) return Promise.resolve(null);
    return ctx.loaders.user.load(parent.userId);
  }
}
