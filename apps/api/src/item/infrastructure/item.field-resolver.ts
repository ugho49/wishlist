import { Logger } from '@nestjs/common';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { type GraphQLContext } from '../../core/graphql/graphql.context';
import { type ItemTaker, type User } from '../../gql/generated-types';

@Resolver('ItemTaker')
export class ItemTakerFieldResolver {
  private readonly logger = new Logger(ItemTakerFieldResolver.name);

  @ResolveField()
  async user(@Parent() taker: ItemTaker, @Context() ctx: GraphQLContext): Promise<User | undefined> {
    const user = await ctx.loaders.user.load(taker.userId);
    if (!user) {
      this.logger.warn('Taker user not found', { userId: taker.userId });
      return undefined;
    }
    return user;
  }
}
