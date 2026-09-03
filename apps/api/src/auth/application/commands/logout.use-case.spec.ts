import type { UserSessionRepository } from '../../../user/domain/repository/user-session.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserSessionBuilder } from '../../../../test-utils/builders/user-session.builder';
import { createMock } from '../../../../test-utils/mocks';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';
import { LogoutUseCase } from './logout.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('LogoutUseCase', () => {
  const sessionRepository = createMock<UserSessionRepository>();

  let useCase: LogoutUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new LogoutUseCase(sessionRepository);
  });

  it('should no-op when the refresh token is unknown', async () => {
    sessionRepository.findByTokenHash.mockResolvedValueOnce(undefined);

    await useCase.execute({ refreshToken: 'unknown' });

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should no-op when the session is already revoked', async () => {
    const user = new UserBuilder().build();
    const session = new UserSessionBuilder().revoked().build(user);
    sessionRepository.findByTokenHash.mockResolvedValueOnce(session);

    await useCase.execute({ refreshToken: 'token' });

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should revoke an active session', async () => {
    const user = new UserBuilder().build();
    const rawToken = RefreshTokenManager.generateRaw();
    const session = new UserSessionBuilder().withTokenHash(RefreshTokenManager.hash(rawToken)).build(user);
    sessionRepository.findByTokenHash.mockResolvedValueOnce(session);

    await useCase.execute({ refreshToken: rawToken });

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(sessionRepository.save.mock.calls[0]?.[0]?.revokedAt).toBeInstanceOf(Date);
  });
});
