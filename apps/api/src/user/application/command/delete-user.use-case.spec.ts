import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { DeleteUserUseCase } from './delete-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('DeleteUserUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: DeleteUserUseCase;
  let admin: User;
  let target: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();
    target = new UserBuilder().withEmail('target@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(target);

    useCase = new DeleteUserUseCase(userRepository);
  });

  it('should reject when the current user tries to delete themselves', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(admin), userId: admin.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when an admin tries to delete another admin', async () => {
    const otherAdmin = new UserBuilder().withEmail('other-admin@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherAdmin);

    await expect(useCase.execute({ currentUser: toCurrentUser(admin), userId: otherAdmin.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when a super-admin tries to delete another super-admin', async () => {
    const superAdmin = new UserBuilder().withEmail('super@test.fr').asSuperAdmin().build();
    const otherSuperAdmin = new UserBuilder().withEmail('other-super@test.fr').asSuperAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherSuperAdmin);

    await expect(
      useCase.execute({ currentUser: toCurrentUser(superAdmin), userId: otherSuperAdmin.id }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete a regular user when requested by an admin', async () => {
    await useCase.execute({ currentUser: toCurrentUser(admin), userId: target.id });

    expect(userRepository.delete).toHaveBeenCalledWith(target.id);
  });

  it('should delete an admin when requested by a super-admin', async () => {
    const superAdmin = new UserBuilder().withEmail('super@test.fr').asSuperAdmin().build();
    const otherAdmin = new UserBuilder().withEmail('other-admin@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherAdmin);

    await useCase.execute({ currentUser: toCurrentUser(superAdmin), userId: otherAdmin.id });

    expect(userRepository.delete).toHaveBeenCalledWith(otherAdmin.id);
  });
});
