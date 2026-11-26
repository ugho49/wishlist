import type { ICurrentUser, UserId } from '@wishlist/common';

import { Args, Mutation, Query, Resolver } from '@znight/graphql';

import { Authenticated } from '../../../auth/infrastructure/decorators/public.metadata';
import { RateLimit } from '../../../auth/infrastructure/decorators/rate-limit.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import {
  type AddFriendResult,
  FriendSource,
  type FriendsResult,
  type HideFriendResult,
  type UnhideFriendResult,
} from '../../../gql/generated-types';
import { AddFriendUseCase } from '../../application/command/add-friend.use-case';
import { HideFriendUseCase } from '../../application/command/hide-friend.use-case';
import { UnhideFriendUseCase } from '../../application/command/unhide-friend.use-case';
import { GetFriendsUseCase } from '../../application/query/get-friends.use-case';
import { userMapper } from '../user.mapper';
import { FriendUserIdSchema, UserByEmailSchema } from '../user.schema';

@Resolver()
@Authenticated()
export class FriendResolver {
  constructor(
    private readonly getFriendsUseCase: GetFriendsUseCase,
    private readonly addFriendUseCase: AddFriendUseCase,
    private readonly hideFriendUseCase: HideFriendUseCase,
    private readonly unhideFriendUseCase: UnhideFriendUseCase,
  ) {}

  @Query()
  async friends(@CurrentUser() currentUser: ICurrentUser): Promise<FriendsResult> {
    const { friends, hidden } = await this.getFriendsUseCase.execute({ currentUser });

    return {
      __typename: 'FriendsOutput',
      friends: friends.map(friend => ({
        __typename: 'Friend',
        user: userMapper.toGqlUser(friend.user),
        source: friend.added ? FriendSource.Added : FriendSource.Event,
        sharedEventsCount: friend.sharedEventsCount,
      })),
      hidden: hidden.map(user => userMapper.toGqlUser(user)),
    };
  }

  // Tells whether an email has an account, like userByEmail: same counters
  @Mutation()
  @RateLimit('userByEmail')
  async addFriend(
    @Args('email', UserByEmailSchema) email: string,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AddFriendResult> {
    await this.addFriendUseCase.execute({ currentUser, email });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async hideFriend(
    @Args('userId', FriendUserIdSchema) userId: UserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<HideFriendResult> {
    await this.hideFriendUseCase.execute({ currentUser, userId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async unhideFriend(
    @Args('userId', FriendUserIdSchema) userId: UserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<UnhideFriendResult> {
    await this.unhideFriendUseCase.execute({ currentUser, userId });
    return { __typename: 'VoidOutput', success: true };
  }
}
