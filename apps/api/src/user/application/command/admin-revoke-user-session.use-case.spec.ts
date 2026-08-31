import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserRefreshTokenBuilder } from '../../../../test-utils/builders/user-refresh-token.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { AdminRevokeUserSessionUseCase } from './admin-revoke-user-session.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AdminRevokeUserSessionUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const refreshTokenRepository = createMock<UserRefreshTokenRepository>();

  let useCase: AdminRevokeUserSessionUseCase;
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
    useCase = new AdminRevokeUserSessionUseCase(userRepository, refreshTokenRepository);
  });

  it('should reject when the admin targets themselves', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        userId: admin.id,
        sessionId: crypto.randomUUID() as never,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when an admin tries to manage another admin', async () => {
    const otherAdmin = new UserBuilder().withEmail('other-admin@test.fr').asAdmin().build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(otherAdmin);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        userId: otherAdmin.id,
        sessionId: crypto.randomUUID() as never,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject when the session does not belong to the user', async () => {
    const other = new UserBuilder().withEmail('other@test.fr').build();
    const session = new UserRefreshTokenBuilder().build(other);
    refreshTokenRepository.findById.mockResolvedValueOnce(session);

    await expect(
      useCase.execute({ currentUser: toCurrentUser(admin), userId: target.id, sessionId: session.id }),
    ).rejects.toThrow(NotFoundException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should revoke a session of a regular user', async () => {
    const session = new UserRefreshTokenBuilder().build(target);
    refreshTokenRepository.findById.mockResolvedValueOnce(session);

    await useCase.execute({ currentUser: toCurrentUser(admin), userId: target.id, sessionId: session.id });

    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepository.save.mock.calls[0]?.[0]?.revokedAt).toBeInstanceOf(Date);
  });
});
