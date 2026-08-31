import type { ICurrentUser } from '@wishlist/common';

import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type UserSession } from '../../../gql/generated-types';

@Resolver('UserSession')
export class UserSessionFieldResolver {
  @ResolveField()
  current(@Parent() session: UserSession, @GqlCurrentUser() currentUser: ICurrentUser): boolean {
    return currentUser.sessionId === session.id;
  }
}
