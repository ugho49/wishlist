import type { UserRefreshTokenRepository } from '../../../user/domain/repository/user-refresh-token.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserRefreshTokenBuilder } from '../../../../test-utils/builders/user-refresh-token.builder';
import { createMock } from '../../../../test-utils/mocks';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';
import { LogoutUseCase } from './logout.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('LogoutUseCase', () => {
  const refreshTokenRepository = createMock<UserRefreshTokenRepository>();

  let useCase: LogoutUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new LogoutUseCase(refreshTokenRepository);
  });

  it('should no-op when the refresh token is unknown', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(undefined);

    await useCase.execute({ refreshToken: 'unknown' });

    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should no-op when the session is already revoked', async () => {
    const user = new UserBuilder().build();
    const session = new UserRefreshTokenBuilder().revoked().build(user);
    refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(session);

    await useCase.execute({ refreshToken: 'token' });

    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should revoke an active session', async () => {
    const user = new UserBuilder().build();
    const rawToken = RefreshTokenManager.generateRaw();
    const session = new UserRefreshTokenBuilder().withTokenHash(RefreshTokenManager.hash(rawToken)).build(user);
    refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(session);

    await useCase.execute({ refreshToken: rawToken });

    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepository.save.mock.calls[0]?.[0]?.revokedAt).toBeInstanceOf(Date);
  });
});
