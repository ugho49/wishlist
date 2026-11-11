import { Loader, Parent, ResolveField, Resolver } from '@znight/graphql';

import { type UserAccount, type UserFull, type UserSession } from '../../../gql/generated-types';
import { UserAccountsByUserId, UserSessionsByUserId } from '../user.dataloader';

@Resolver('UserFull')
export class UserAdminFieldResolver {
  @ResolveField()
  accounts(
    @Parent() user: UserFull,
    @Loader() userAccountsLoader: Loader<UserAccountsByUserId>,
  ): Promise<UserAccount[]> {
    return userAccountsLoader.load(user.id);
  }

  @ResolveField()
  sessions(
    @Parent() user: UserFull,
    @Loader() userSessionsLoader: Loader<UserSessionsByUserId>,
  ): Promise<UserSession[]> {
    return userSessionsLoader.load(user.id);
  }
}
