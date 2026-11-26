import type { UserContactId, UserId } from '@wishlist/common';
import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { uuid } from '@wishlist/common';
import { NotFoundException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserContact } from '../../domain/model/user-contact.model';
import { UserContactStatus } from '../../domain/user-contact-status.enum';
import { HideFriendUseCase } from './hide-friend.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('HideFriendUseCase', () => {
  const userContactRepository = createMock<UserContactRepository>();

  let useCase: HideFriendUseCase;
  let currentUser: User;
  let friendId: UserId;
  let contactId: UserContactId;

  const contactWith = (status: UserContactStatus) =>
    UserContact.create({ id: uuid() as UserContactId, ownerUserId: currentUser.id, contactUserId: friendId, status });

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().build();
    friendId = uuid() as UserId;
    contactId = uuid() as UserContactId;

    userContactRepository.findByOwnerAndContact.mockResolvedValue(undefined);
    userContactRepository.isInCircle.mockResolvedValue(true);
    userContactRepository.newId.mockReturnValue(contactId);

    useCase = new HideFriendUseCase(userContactRepository);
  });

  it('should reject a user who is not in the circle of the current user', async () => {
    userContactRepository.isInCircle.mockResolvedValueOnce(false);

    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), userId: friendId })).rejects.toThrow(
      NotFoundException,
    );
    expect(userContactRepository.isInCircle).toHaveBeenCalledWith(currentUser.id, friendId);
    expect(userContactRepository.save).not.toHaveBeenCalled();
  });

  it('should do nothing when the user is already hidden', async () => {
    userContactRepository.findByOwnerAndContact.mockResolvedValueOnce(contactWith(UserContactStatus.HIDDEN));

    await useCase.execute({ currentUser: toCurrentUser(currentUser), userId: friendId });

    expect(userContactRepository.isInCircle).not.toHaveBeenCalled();
    expect(userContactRepository.save).not.toHaveBeenCalled();
  });

  it('should hide someone the current user shares events with', async () => {
    await useCase.execute({ currentUser: toCurrentUser(currentUser), userId: friendId });

    expect(userContactRepository.save.mock.calls[0]?.[0]).toMatchObject({
      id: contactId,
      ownerUserId: currentUser.id,
      contactUserId: friendId,
      status: UserContactStatus.HIDDEN,
    });
  });

  it('should hide a friend the current user added', async () => {
    const added = contactWith(UserContactStatus.ADDED);
    userContactRepository.findByOwnerAndContact.mockResolvedValueOnce(added);

    await useCase.execute({ currentUser: toCurrentUser(currentUser), userId: friendId });

    expect(userContactRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: added.id, status: UserContactStatus.HIDDEN }),
    );
  });
});
