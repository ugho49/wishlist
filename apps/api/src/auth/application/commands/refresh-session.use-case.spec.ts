import type { ConfigType } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { UserRefreshTokenRepository } from '../../../user/domain/repository/user-refresh-token.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserRefreshTokenBuilder } from '../../../../test-utils/builders/user-refresh-token.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { UserRefreshToken } from '../../../user/domain/model/user-refresh-token.model';
import authConfig from '../../infrastructure/auth.config';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RefreshSessionUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const refreshTokenRepository = createMock<UserRefreshTokenRepository>();
  const jwtService = createMock<JwtService>();
  const config = { refreshToken: { duration: '30d' } } as ConfigType<typeof authConfig>;

  let useCase: RefreshSessionUseCase;
  let user: User;
  let session: UserRefreshToken;
  let rawToken: string;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    rawToken = RefreshTokenManager.generateRaw();
    session = new UserRefreshTokenBuilder().withTokenHash(RefreshTokenManager.hash(rawToken)).build(user);

    refreshTokenRepository.findByTokenHash.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('new-access-token');

    useCase = new RefreshSessionUseCase(userRepository, refreshTokenRepository, config, jwtService);
  });

  it('should reject when the refresh token is unknown', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the session is revoked', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(
      new UserRefreshTokenBuilder().withTokenHash(session.tokenHash).revoked().build(user),
    );

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the session is expired', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(
      new UserRefreshTokenBuilder().withTokenHash(session.tokenHash).expired().build(user),
    );

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the user is missing or disabled', async () => {
    userRepository.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the user is disabled', async () => {
    userRepository.findById.mockResolvedValueOnce(new UserBuilder().withEmail('jean@test.fr').disabled().build());

    await expect(useCase.execute({ refreshToken: rawToken, ip: '10.0.0.1' })).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
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
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    const saved = refreshTokenRepository.save.mock.calls[0]?.[0];
    expect(saved?.id).toBe(session.id);
    expect(saved?.tokenHash).toBe(RefreshTokenManager.hash(result.refreshToken));
    expect(saved?.tokenHash).not.toBe(session.tokenHash);
    expect(saved?.ip).toBe('10.0.0.2');
    expect(saved?.userAgent).toBe('Firefox');
  });
});
