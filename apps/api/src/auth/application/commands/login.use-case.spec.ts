import type { ConfigType } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { UserRefreshTokenId } from '@wishlist/common';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { UserAccountRepository } from '../../../user/domain/repository/user-account.repository';
import type { UserRefreshTokenRepository } from '../../../user/domain/repository/user-refresh-token.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { UserRefreshToken } from '../../../user/domain/model/user-refresh-token.model';
import authConfig from '../../infrastructure/auth.config';
import { PasswordManager } from '../../infrastructure/util/password-manager';
import { LoginUseCase } from './login.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const PASSWORD = 'Secret123!';

describe('LoginUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const refreshTokenRepository = createMock<UserRefreshTokenRepository>();
  const jwtService = createMock<JwtService>();
  const config = { refreshToken: { duration: '30d' } } as ConfigType<typeof authConfig>;

  let useCase: LoginUseCase;
  let user: User;
  let passwordHash: string;
  let sessionId: UserRefreshTokenId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(async () => {
    mock.clearAllMocks();

    passwordHash = await PasswordManager.hash(PASSWORD);
    user = new UserBuilder().withEmail('jean@test.fr').build();
    sessionId = uuid() as UserRefreshTokenId;
    userRepository.findByEmail.mockResolvedValue(user);
    userAccountRepository.findByUserIdAndProvider.mockResolvedValue(
      new UserAccountBuilder().buildPassword(user, passwordHash),
    );
    refreshTokenRepository.newId.mockReturnValue(sessionId);
    jwtService.sign.mockReturnValue('token');

    useCase = new LoginUseCase(userRepository, userAccountRepository, refreshTokenRepository, config, jwtService);
  });

  it('should reject when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ email: 'unknown@test.fr', password: PASSWORD, ip: '127.0.0.1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should reject when the user is disabled', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('jean@test.fr').disabled().build());

    await expect(useCase.execute({ email: 'jean@test.fr', password: PASSWORD, ip: '127.0.0.1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the password is incorrect', async () => {
    await expect(
      useCase.execute({ email: 'jean@test.fr', password: 'WrongPassword1!', ip: '127.0.0.1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the user has no password', async () => {
    userAccountRepository.findByUserIdAndProvider.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ email: 'jean@test.fr', password: PASSWORD, ip: '127.0.0.1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should return tokens and persist a session', async () => {
    const result = await useCase.execute({
      email: 'jean@test.fr',
      password: PASSWORD,
      ip: '10.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBeString();
    expect(result.refreshToken.length).toBeGreaterThan(0);
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
      sid: sessionId,
    });
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    const savedSession = refreshTokenRepository.save.mock.calls[0]?.[0];
    expect(savedSession).toBeInstanceOf(UserRefreshToken);
    expect(savedSession?.userId).toBe(user.id);
    expect(savedSession?.ip).toBe('10.0.0.1');
    expect(savedSession?.userAgent).toBe('Mozilla/5.0');
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
