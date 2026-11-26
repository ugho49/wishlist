import type { UserContactId, UserId } from '@wishlist/common';
import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { uuid } from '@wishlist/common';
import { NotFoundException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserContact } from '../../domain/model/user-contact.model';
import { UserContactStatus } from '../../domain/user-contact-status.enum';
import { UnhideFriendUseCase } from './unhide-friend.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UnhideFriendUseCase', () => {
  const userContactRepository = createMock<UserContactRepository>();

  let useCase: UnhideFriendUseCase;
  let currentUser: User;
  let friendId: UserId;

  const contactWith = (status: UserContactStatus) =>
    UserContact.create({ id: uuid() as UserContactId, ownerUserId: currentUser.id, contactUserId: friendId, status });

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().build();
    friendId = uuid() as UserId;
    userContactRepository.findByOwnerAndContact.mockResolvedValue(contactWith(UserContactStatus.HIDDEN));

    useCase = new UnhideFriendUseCase(userContactRepository);
  });

  it.each([
    { case: 'the user was never hidden', contact: () => undefined },
    { case: 'the user is an added friend', contact: () => contactWith(UserContactStatus.ADDED) },
  ])('should reject when $case', async ({ contact }) => {
    userContactRepository.findByOwnerAndContact.mockResolvedValueOnce(contact());

    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), userId: friendId })).rejects.toThrow(
      NotFoundException,
    );
    expect(userContactRepository.save).not.toHaveBeenCalled();
  });

  it('should bring the hidden user back as an added friend', async () => {
    await useCase.execute({ currentUser: toCurrentUser(currentUser), userId: friendId });

    expect(userContactRepository.findByOwnerAndContact).toHaveBeenCalledWith(currentUser.id, friendId);
    expect(userContactRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ contactUserId: friendId, status: UserContactStatus.ADDED }),
    );
  });
});
