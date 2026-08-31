import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { User } from '../../domain/model/user.model';
import { UserAccount } from '../../domain/model/user-account.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';
import { UpdateUserFullUseCase } from './update-user-full.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserFullUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: UpdateUserFullUseCase;
  let admin: User;
  let target: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();
    target = new UserBuilder().withEmail('target@test.fr').withName({ firstName: 'Jean', lastName: 'Dupont' }).build();
    userRepository.findByIdOrFail.mockResolvedValue(target);
    userRepository.findByEmail.mockResolvedValue(undefined);
    userAccountRepository.findPasswordByUserId.mockResolvedValue(undefined);
    userAccountRepository.newId.mockReturnValue(crypto.randomUUID() as never);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new UpdateUserFullUseCase(userRepository, userAccountRepository, transactionManager);
  });

  it('should reject when the current user tries to update themselves', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        userId: admin.id,
        updateUser: { firstname: 'Paul' },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when an admin tries to update another admin', async () => {
    const otherAdmin = new UserBuilder().withEmail('other-admin@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherAdmin);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        userId: otherAdmin.id,
        updateUser: { firstname: 'Paul' },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when a super-admin tries to update another super-admin', async () => {
    const superAdmin = new UserBuilder().withEmail('super@test.fr').asSuperAdmin().build();
    const otherSuperAdmin = new UserBuilder().withEmail('other-super@test.fr').asSuperAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherSuperAdmin);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(superAdmin),
        userId: otherSuperAdmin.id,
        updateUser: { firstname: 'Paul' },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the new email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('taken@test.fr').build());

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        userId: target.id,
        updateUser: { email: 'taken@test.fr' },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should update the user when requested by an admin', async () => {
    const birthday = new Date('1990-01-01');

    await useCase.execute({
      currentUser: toCurrentUser(admin),
      userId: target.id,
      updateUser: {
        email: 'new@test.fr',
        newPassword: 'Secret123!',
        firstname: 'Paul',
        lastname: 'Martin',
        birthday,
        isEnabled: false,
      },
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.email).toBe('new@test.fr');
    expect(savedUser?.firstName).toBe('Paul');
    expect(savedUser?.lastName).toBe('Martin');
    expect(savedUser?.birthday).toEqual(birthday);
    expect(savedUser?.isEnabled).toBe(false);
    expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    const savedAccount = userAccountRepository.save.mock.calls[0]?.[0];
    expect(savedAccount).toBeInstanceOf(UserAccount);
    expect(savedAccount?.provider).toBe(UserAccountProvider.PASSWORD);
    expect(await PasswordManager.verify({ hash: savedAccount?.passwordHash, plainPassword: 'Secret123!' })).toBe(true);
  });

  it('should update an admin when requested by a super-admin', async () => {
    const superAdmin = new UserBuilder().withEmail('super@test.fr').asSuperAdmin().build();
    const otherAdmin = new UserBuilder().withEmail('other-admin@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherAdmin);

    await useCase.execute({
      currentUser: toCurrentUser(superAdmin),
      userId: otherAdmin.id,
      updateUser: { firstname: 'Paul' },
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.firstName).toBe('Paul');
    expect(userAccountRepository.save).not.toHaveBeenCalled();
  });
});
