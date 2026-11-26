import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { NotFoundException } from '@znight/http';

import { UserContact } from '../../domain/model/user-contact.model';
import { UserContactStatus } from '../../domain/user-contact-status.enum';

export type AddFriendInput = {
  currentUser: ICurrentUser;
  /** Already lower-cased by the GraphQL schema */
  email: string;
};

/**
 * Adds the account owning that exact email to the circle of the current user, even without a shared
 * event (and shows them again if they were hidden). One-sided: the friend is not notified.
 */
@Injectable()
export class AddFriendUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userContactRepository: UserContactRepository,
  ) {}

  async execute(input: AddFriendInput): Promise<void> {
    const { currentUser, email } = input;

    const friend = await this.userRepository.findByEmail(email);

    if (!friend?.isEnabled || friend.id === currentUser.id) {
      throw new NotFoundException('No account found with this email');
    }

    const existing = await this.userContactRepository.findByOwnerAndContact(currentUser.id, friend.id);
    const contact =
      existing?.withStatus(UserContactStatus.ADDED) ??
      UserContact.create({
        id: this.userContactRepository.newId(),
        ownerUserId: currentUser.id,
        contactUserId: friend.id,
        status: UserContactStatus.ADDED,
      });

    await this.userContactRepository.save(contact);
  }
}
