import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { type UserAccount, type UserFull, type UserSession } from '../../../gql/generated-types';

@Resolver('UserFull')
export class UserAdminFieldResolver {
  @ResolveField()
  accounts(@Parent() user: UserFull, @Context() ctx: GraphQLContext): Promise<UserAccount[]> {
    return ctx.loaders.userAccountsByUser.load(user.id);
  }

  @ResolveField()
  sessions(@Parent() user: UserFull, @Context() ctx: GraphQLContext): Promise<UserSession[]> {
    return ctx.loaders.userSessionsByUser.load(user.id);
  }
}
