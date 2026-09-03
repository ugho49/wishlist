import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Logger, NotFoundException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserSessionBuilder } from '../../../../test-utils/builders/user-session.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { RevokeUserSessionUseCase } from './revoke-user-session.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RevokeUserSessionUseCase', () => {
  const sessionRepository = createMock<UserSessionRepository>();

  let useCase: RevokeUserSessionUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    user = new UserBuilder().withEmail('jean@test.fr').build();
    useCase = new RevokeUserSessionUseCase(sessionRepository);
  });

  it('should reject when the session does not exist', async () => {
    sessionRepository.findById.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute({ currentUser: toCurrentUser(user), sessionId: crypto.randomUUID() as never }),
    ).rejects.toThrow(NotFoundException);
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the session belongs to another user', async () => {
    const other = new UserBuilder().withEmail('other@test.fr').build();
    const session = new UserSessionBuilder().build(other);
    sessionRepository.findById.mockResolvedValueOnce(session);

    await expect(useCase.execute({ currentUser: toCurrentUser(user), sessionId: session.id })).rejects.toThrow(
      NotFoundException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should no-op when the session is already revoked', async () => {
    const session = new UserSessionBuilder().revoked().build(user);
    sessionRepository.findById.mockResolvedValueOnce(session);

    await useCase.execute({ currentUser: toCurrentUser(user), sessionId: session.id });

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should revoke an owned active session', async () => {
    const session = new UserSessionBuilder().build(user);
    sessionRepository.findById.mockResolvedValueOnce(session);

    await useCase.execute({ currentUser: toCurrentUser(user), sessionId: session.id });

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(sessionRepository.save.mock.calls[0]?.[0]?.revokedAt).toBeInstanceOf(Date);
  });
});
