import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { AdminRevokeAllUserSessionsUseCase } from './admin-revoke-all-user-sessions.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AdminRevokeAllUserSessionsUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const sessionRepository = createMock<UserSessionRepository>();

  let useCase: AdminRevokeAllUserSessionsUseCase;
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
    useCase = new AdminRevokeAllUserSessionsUseCase(userRepository, sessionRepository);
  });

  it('should reject when the admin targets themselves', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(admin), userId: admin.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(sessionRepository.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('should revoke all sessions of a regular user', async () => {
    await useCase.execute({ currentUser: toCurrentUser(admin), userId: target.id });

    expect(sessionRepository.revokeAllByUserId).toHaveBeenCalledWith(target.id);
  });
});
