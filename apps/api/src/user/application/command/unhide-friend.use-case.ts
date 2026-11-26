import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';

import { UserContactStatus } from '../../domain/user-contact-status.enum';

export type UnhideFriendInput = {
  currentUser: ICurrentUser;
  userId: UserId;
};

/** Brings a hidden user back into the circle of the current user, as a friend they added. */
@Injectable()
export class UnhideFriendUseCase {
  constructor(private readonly userContactRepository: UserContactRepository) {}

  async execute(input: UnhideFriendInput): Promise<void> {
    const { currentUser, userId } = input;

    const existing = await this.userContactRepository.findByOwnerAndContact(currentUser.id, userId);

    if (!existing?.isHidden()) {
      throw new NotFoundException('Hidden friend not found');
    }

    await this.userContactRepository.save(existing.withStatus(UserContactStatus.ADDED));
  }
}
