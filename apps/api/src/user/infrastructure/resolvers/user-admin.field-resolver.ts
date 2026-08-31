import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { type UserAccount, type UserFull } from '../../../gql/generated-types';

@Resolver('UserFull')
export class UserAdminFieldResolver {
  @ResolveField()
  accounts(@Parent() user: UserFull, @Context() ctx: GraphQLContext): Promise<UserAccount[]> {
    return ctx.loaders.userAccountsByUser.load(user.id);
  }
}
