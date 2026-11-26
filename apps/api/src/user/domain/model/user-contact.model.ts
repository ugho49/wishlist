import type { UserContactId, UserId } from '@wishlist/common';

import { UserContactStatus } from '../user-contact-status.enum';

export type UserContactProps = {
  id: UserContactId;
  ownerUserId: UserId;
  contactUserId: UserId;
  status: UserContactStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * A one-sided decision of a user (`owner`) about another one (`contact`): a friend added by email,
 * or someone hidden from their circle. The contact is never notified.
 */
export class UserContact {
  public readonly id: UserContactId;
  public readonly ownerUserId: UserId;
  public readonly contactUserId: UserId;
  public readonly status: UserContactStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserContactProps) {
    this.id = props.id;
    this.ownerUserId = props.ownerUserId;
    this.contactUserId = props.contactUserId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(params: {
    id: UserContactId;
    ownerUserId: UserId;
    contactUserId: UserId;
    status: UserContactStatus;
  }): UserContact {
    if (params.ownerUserId === params.contactUserId) {
      throw new Error('A user cannot be their own contact');
    }

    const now = new Date();
    return new UserContact({ ...params, createdAt: now, updatedAt: now });
  }

  isHidden(): boolean {
    return this.status === UserContactStatus.HIDDEN;
  }

  withStatus(status: UserContactStatus): UserContact {
    if (status === this.status) return this;
    return new UserContact({ ...this, status, updatedAt: new Date() });
  }
}
