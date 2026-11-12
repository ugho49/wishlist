import { Loader, Parent, ResolveField, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type ItemTaker, type User } from '../../gql/generated-types';
import { UsersById } from '../../user/infrastructure/user.dataloader';

@Resolver('ItemTaker')
export class ItemTakerFieldResolver {
  private readonly logger = getLogger(ItemTakerFieldResolver.name);

  @ResolveField()
  async user(@Parent() taker: ItemTaker, @Loader() usersLoader: Loader<UsersById>): Promise<User> {
    const user = await usersLoader.load(taker.userId);
    if (!user) {
      this.logger.warn('Taker user not found', { userId: taker.userId });
      throw new NotFoundException(`Taker user ${taker.userId} not found`);
    }
    return user;
  }
}
