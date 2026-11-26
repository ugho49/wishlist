import type { User } from '../../domain/model/user.model';
import type { Friend, UserContactRepository } from '../../domain/repository/user-contact.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';

export type GetFriendsInput = {
  currentUser: ICurrentUser;
};

export type GetFriendsOutput = {
  friends: Friend[];
  hidden: User[];
};

/** The circle of the current user (co-attendees and added friends) and the people they hid. */
@Injectable()
export class GetFriendsUseCase {
  constructor(private readonly userContactRepository: UserContactRepository) {}

  async execute(input: GetFriendsInput): Promise<GetFriendsOutput> {
    const [friends, hidden] = await Promise.all([
      this.userContactRepository.findFriends(input.currentUser.id),
      this.userContactRepository.findHiddenUsers(input.currentUser.id),
    ]);

    return { friends, hidden };
  }
}
