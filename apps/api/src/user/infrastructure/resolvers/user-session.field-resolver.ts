import type { ICurrentUser } from '@wishlist/common';

import { Parent, ResolveField, Resolver } from '@znight/graphql';

import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type UserSession } from '../../../gql/generated-types';

@Resolver('UserSession')
export class UserSessionFieldResolver {
  @ResolveField()
  current(@Parent() session: UserSession, @CurrentUser() currentUser: ICurrentUser): boolean {
    return currentUser.sessionId === session.id;
  }
}
