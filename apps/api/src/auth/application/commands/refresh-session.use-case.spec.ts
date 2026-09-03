import type { ConfigType } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { UserSessionRepository } from '../../../user/domain/repository/user-session.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserSessionBuilder } from '../../../../test-utils/builders/user-session.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { UserSession } from '../../../user/domain/model/user-session.model';
import authConfig from '../../infrastructure/auth.config';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RefreshSessionUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const sessionRepository = createMock<UserSessionRepository>();
  const jwtService = createMock<JwtService>();
  const config = { refreshToken: { duration: '30d' } } as ConfigType<typeof authConfig>;

  let useCase: RefreshSessionUseCase;
  let user: User;
  let session: UserSession;
  let rawToken: string;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    rawToken = RefreshTokenManager.generateRaw();
    session = new UserSessionBuilder().withTokenHash(RefreshTokenManager.hash(rawToken)).build(user);

    sessionRepository.findByTokenHash.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('new-access-token');

    useCase = new RefreshSessionUseCase(userRepository, sessionRepository, config, jwtService);
  });

  it('should reject when the refresh token is unknown', async () => {
    sessionRepository.findByTokenHash.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the session is revoked', async () => {
    sessionRepository.findByTokenHash.mockResolvedValueOnce(
      new UserSessionBuilder().withTokenHash(session.tokenHash).revoked().build(user),
    );

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the session is expired', async () => {
    sessionRepository.findByTokenHash.mockResolvedValueOnce(
      new UserSessionBuilder().withTokenHash(session.tokenHash).expired().build(user),
    );

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the user is missing or disabled', async () => {
    userRepository.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the user is disabled', async () => {
    userRepository.findById.mockResolvedValueOnce(new UserBuilder().withEmail('jean@test.fr').disabled().build());

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should issue new tokens and rotate the refresh token', async () => {
    const result = await useCase.execute({ refreshToken: rawToken, ip: '10.0.0.2', userAgent: 'Firefox' });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).not.toBe(rawToken);
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
      sid: session.id,
    });
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    const saved = sessionRepository.save.mock.calls[0]?.[0];
    expect(saved?.id).toBe(session.id);
    expect(saved?.tokenHash).toBe(RefreshTokenManager.hash(result.refreshToken));
    expect(saved?.tokenHash).not.toBe(session.tokenHash);
    expect(saved?.ip).toBe('10.0.0.2');
    expect(saved?.userAgent).toBe(session.userAgent);
  });
});
