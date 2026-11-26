import type { UserContactId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserContactRepository } from '../../domain/repository/user-contact.repository';

import { uuid } from '@wishlist/common';
import { NotFoundException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserContact } from '../../domain/model/user-contact.model';
import { UserContactStatus } from '../../domain/user-contact-status.enum';
import { AddFriendUseCase } from './add-friend.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AddFriendUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userContactRepository = createMock<UserContactRepository>();

  let useCase: AddFriendUseCase;
  let currentUser: User;
  let friend: User;
  let contactId: UserContactId;

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().withEmail('jean@test.fr').build();
    friend = new UserBuilder().withEmail('paul@test.fr').build();
    contactId = uuid() as UserContactId;

    userRepository.findByEmail.mockResolvedValue(friend);
    userContactRepository.findByOwnerAndContact.mockResolvedValue(undefined);
    userContactRepository.newId.mockReturnValue(contactId);

    useCase = new AddFriendUseCase(userRepository, userContactRepository);
  });

  it.each([
    { case: 'the email has no account', found: () => undefined },
    { case: 'the account is disabled', found: () => new UserBuilder().disabled().build() },
    { case: 'the email is the one of the current user', found: () => currentUser },
  ])('should reject when $case', async ({ found }) => {
    userRepository.findByEmail.mockResolvedValueOnce(found());

    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'x@test.fr' })).rejects.toThrow(
      NotFoundException,
    );
    expect(userContactRepository.save).not.toHaveBeenCalled();
  });

  it('should add the account as a friend of the current user', async () => {
    await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr' });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('paul@test.fr');
    const saved = userContactRepository.save.mock.calls[0]?.[0];
    expect(saved).toMatchObject({
      id: contactId,
      ownerUserId: currentUser.id,
      contactUserId: friend.id,
      status: UserContactStatus.ADDED,
    });
  });

  it('should add again someone the current user hid', async () => {
    const hidden = UserContact.create({
      id: uuid() as UserContactId,
      ownerUserId: currentUser.id,
      contactUserId: friend.id,
      status: UserContactStatus.HIDDEN,
    });
    userContactRepository.findByOwnerAndContact.mockResolvedValueOnce(hidden);

    await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr' });

    expect(userContactRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: hidden.id, status: UserContactStatus.ADDED }),
    );
  });
});
