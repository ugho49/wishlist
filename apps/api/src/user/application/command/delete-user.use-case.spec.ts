import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { SecretSantaRepository } from '../../../secret-santa/domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../../secret-santa/domain/repository/secret-santa-user.repository';
import type { UserRepository } from '../../domain/repository/user.repository';

import { UnauthorizedException } from '@znight/http';

import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { User } from '../../domain/model/user.model';
import { DeleteUserUseCase } from './delete-user.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('DeleteUserUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const transactionManager = createMock<TransactionManager>();
  const tx = {} as never;

  let useCase: DeleteUserUseCase;
  let admin: User;
  let target: User;

  beforeEach(() => {
    mock.clearAllMocks();

    admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();
    target = new UserBuilder().withEmail('target@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(target);
    secretSantaUserRepository.findByUserId.mockResolvedValue([]);
    transactionManager.runInTransaction.mockImplementation(async fn => fn(tx));

    useCase = new DeleteUserUseCase(
      userRepository,
      secretSantaRepository,
      secretSantaUserRepository,
      transactionManager,
    );
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

    expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
    expect(userRepository.delete).toHaveBeenCalledWith(target.id, tx);
  });

  it('should delete an admin when requested by a super-admin', async () => {
    const superAdmin = new UserBuilder().withEmail('super@test.fr').asSuperAdmin().build();
    const otherAdmin = new UserBuilder().withEmail('other-admin@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherAdmin);

    await useCase.execute({ currentUser: toCurrentUser(superAdmin), userId: otherAdmin.id });

    expect(userRepository.delete).toHaveBeenCalledWith(otherAdmin.id, tx);
  });

  describe('when the user takes part in secret santas', () => {
    it('should take the user out of the secret santas whose draw has not started, then delete the user', async () => {
      const firstSecretSanta = new SecretSantaBuilder().build();
      const secondSecretSanta = new SecretSantaBuilder().build();
      const firstParticipation = new SecretSantaUserBuilder().withSecretSantaId(firstSecretSanta.id).build();
      const secondParticipation = new SecretSantaUserBuilder().withSecretSantaId(secondSecretSanta.id).build();
      secretSantaUserRepository.findByUserId.mockResolvedValueOnce([firstParticipation, secondParticipation]);
      secretSantaRepository.findByIdOrFail
        .mockResolvedValueOnce(firstSecretSanta)
        .mockResolvedValueOnce(secondSecretSanta);

      await useCase.execute({ currentUser: toCurrentUser(admin), userId: target.id });

      expect(secretSantaUserRepository.findByUserId).toHaveBeenCalledWith(target.id);
      expect(secretSantaRepository.findByIdOrFail).toHaveBeenCalledWith(firstSecretSanta.id);
      expect(secretSantaRepository.findByIdOrFail).toHaveBeenCalledWith(secondSecretSanta.id);
      expect(secretSantaUserRepository.delete).toHaveBeenCalledTimes(2);
      expect(secretSantaUserRepository.delete).toHaveBeenCalledWith(firstParticipation.id, tx);
      expect(secretSantaUserRepository.delete).toHaveBeenCalledWith(secondParticipation.id, tx);
      expect(userRepository.delete).toHaveBeenCalledWith(target.id, tx);
    });

    it('should refuse with a business rule when a draw has started, without deleting anything', async () => {
      const createdSecretSanta = new SecretSantaBuilder().build();
      const startedSecretSanta = new SecretSantaBuilder().started().build();
      const createdParticipation = new SecretSantaUserBuilder().withSecretSantaId(createdSecretSanta.id).build();
      const startedParticipation = new SecretSantaUserBuilder().withSecretSantaId(startedSecretSanta.id).build();
      secretSantaUserRepository.findByUserId.mockResolvedValueOnce([createdParticipation, startedParticipation]);
      secretSantaRepository.findByIdOrFail
        .mockResolvedValueOnce(createdSecretSanta)
        .mockResolvedValueOnce(startedSecretSanta);

      const execution = useCase.execute({ currentUser: toCurrentUser(admin), userId: target.id });

      await expect(execution).rejects.toThrow(BusinessRuleException);
      await expect(execution).rejects.toMatchObject({ code: 'USER_IN_STARTED_SECRET_SANTA' });
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
      expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});
