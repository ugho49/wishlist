import type { UserContactId, UserId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { UserContactStatus } from '../user-contact-status.enum';
import { UserContact } from './user-contact.model';
import { describe, expect, it } from 'bun:test';

describe('UserContact', () => {
  const ownerUserId = uuid() as UserId;
  const contactUserId = uuid() as UserId;

  it('should refuse a user as their own contact', () => {
    expect(() =>
      UserContact.create({
        id: uuid() as UserContactId,
        ownerUserId,
        contactUserId: ownerUserId,
        status: UserContactStatus.ADDED,
      }),
    ).toThrow('A user cannot be their own contact');
  });

  it('should change the status and keep the identity', () => {
    const contact = UserContact.create({
      id: uuid() as UserContactId,
      ownerUserId,
      contactUserId,
      status: UserContactStatus.ADDED,
    });

    const hidden = contact.withStatus(UserContactStatus.HIDDEN);

    expect(hidden.isHidden()).toBe(true);
    expect(hidden.id).toBe(contact.id);
    expect(contact.isHidden()).toBe(false);
  });

  it('should return the same contact when the status does not change', () => {
    const contact = UserContact.create({
      id: uuid() as UserContactId,
      ownerUserId,
      contactUserId,
      status: UserContactStatus.HIDDEN,
    });

    expect(contact.withStatus(UserContactStatus.HIDDEN)).toBe(contact);
  });
});
