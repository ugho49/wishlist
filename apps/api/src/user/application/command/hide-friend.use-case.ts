import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';

import { UserContact } from '../../domain/model/user-contact.model';
import { UserContactStatus } from '../../domain/user-contact-status.enum';

export type HideFriendInput = {
  currentUser: ICurrentUser;
  userId: UserId;
};

/**
 * Takes someone out of the circle of the current user (friends page, picker suggestions and search),
 * even when they share events. One-sided: they are not notified.
 */
@Injectable()
export class HideFriendUseCase {
  constructor(private readonly userContactRepository: UserContactRepository) {}

  async execute(input: HideFriendInput): Promise<void> {
    const { currentUser, userId } = input;

    const existing = await this.userContactRepository.findByOwnerAndContact(currentUser.id, userId);
    if (existing?.isHidden()) return;

    if (!(await this.userContactRepository.isInCircle(currentUser.id, userId))) {
      throw new NotFoundException('Friend not found');
    }

    const contact =
      existing?.withStatus(UserContactStatus.HIDDEN) ??
      UserContact.create({
        id: this.userContactRepository.newId(),
        ownerUserId: currentUser.id,
        contactUserId: userId,
        status: UserContactStatus.HIDDEN,
      });

    await this.userContactRepository.save(contact);
  }
}
