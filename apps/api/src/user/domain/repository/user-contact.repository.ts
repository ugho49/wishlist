import type { UserContactId, UserId } from '@wishlist/common';
import type { User } from '../model/user.model';
import type { UserContact } from '../model/user-contact.model';

/** Someone of the user's circle, as the friends page shows them. */
export type Friend = {
  user: User;
  /** Added by email (a `added` contact), whether or not they also share events */
  added: boolean;
  /** Events both attend */
  sharedEventsCount: number;
};

export interface UserContactRepository {
  newId(): UserContactId;
  findByOwnerAndContact(ownerUserId: UserId, contactUserId: UserId): Promise<UserContact | undefined>;
  /** Creates or replaces the decision of the owner about the contact (one per pair). */
  save(contact: UserContact): Promise<void>;
  /** The user's circle (co-attendees and added friends, minus the hidden ones), sorted by name. */
  findFriends(userId: UserId): Promise<Friend[]>;
  /** The enabled users the user hid, sorted by name. */
  findHiddenUsers(userId: UserId): Promise<User[]>;
  /** Whether `otherUserId` is part of the user's circle. */
  isInCircle(userId: UserId, otherUserId: UserId): Promise<boolean>;
}
