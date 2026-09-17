import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { Authorities } from '../../domain/authorities.enum';
import { User } from '../../domain/model/user.model';
import { SetUserAdminUseCase } from './set-user-admin.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('SetUserAdminUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const sessionRepository = createMock<UserSessionRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: SetUserAdminUseCase;
  let superAdmin: User;
  let target: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    superAdmin = new UserBuilder().withEmail('super@test.fr').asSuperAdmin().build();
    target = new UserBuilder().withEmail('target@test.fr').withName({ firstName: 'Jean', lastName: 'Dupont' }).build();
    userRepository.findByIdOrFail.mockResolvedValue(target);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new SetUserAdminUseCase(userRepository, sessionRepository, transactionManager);
  });

  it('should reject when the current user tries to update themselves', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(superAdmin),
        userId: superAdmin.id,
        isAdmin: true,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the current user is not a super-admin', async () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        userId: target.id,
        isAdmin: true,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the target is a super-admin', async () => {
    const otherSuperAdmin = new UserBuilder().withEmail('other-super@test.fr').asSuperAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherSuperAdmin);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(superAdmin),
        userId: otherSuperAdmin.id,
        isAdmin: true,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should grant ROLE_ADMIN without revoking sessions', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(superAdmin),
      userId: target.id,
      isAdmin: true,
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.authorities).toEqual([Authorities.ROLE_ADMIN]);
    expect(sessionRepository.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('should revoke ROLE_ADMIN and revoke sessions', async () => {
    const adminTarget = new UserBuilder().withEmail('admin-target@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(adminTarget);

    await useCase.execute({
      currentUser: toCurrentUser(superAdmin),
      userId: adminTarget.id,
      isAdmin: false,
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.authorities).toEqual([Authorities.ROLE_USER]);
    expect(sessionRepository.revokeAllByUserId).toHaveBeenCalledWith(adminTarget.id, { tx: undefined });
  });

  it('should not save when the user is already an admin', async () => {
    const adminTarget = new UserBuilder().withEmail('admin-target@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(adminTarget);

    await useCase.execute({
      currentUser: toCurrentUser(superAdmin),
      userId: adminTarget.id,
      isAdmin: true,
    });

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(sessionRepository.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('should not save when the user is already not an admin', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(superAdmin),
      userId: target.id,
      isAdmin: false,
    });

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(sessionRepository.revokeAllByUserId).not.toHaveBeenCalled();
  });
});
