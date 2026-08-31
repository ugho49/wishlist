import type { JwtService } from '@nestjs/jwt';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { UserAccountRepository } from '../../../user/domain/repository/user-account.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { PasswordManager } from '../../infrastructure/util/password-manager';
import { LoginUseCase } from './login.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const PASSWORD = 'Secret123!';

describe('LoginUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const jwtService = createMock<JwtService>();

  let useCase: LoginUseCase;
  let user: User;
  let passwordHash: string;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(async () => {
    mock.clearAllMocks();

    passwordHash = await PasswordManager.hash(PASSWORD);
    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findByEmail.mockResolvedValue(user);
    userAccountRepository.findPasswordByUserId.mockResolvedValue(
      new UserAccountBuilder().buildPassword(user, passwordHash),
    );
    jwtService.sign.mockReturnValue('token');

    useCase = new LoginUseCase(userRepository, userAccountRepository, jwtService);
  });

  it('should reject when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ email: 'unknown@test.fr', password: PASSWORD, ip: '127.0.0.1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should reject when the user is disabled', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('jean@test.fr').disabled().build());

    await expect(useCase.execute({ email: 'jean@test.fr', password: PASSWORD, ip: '127.0.0.1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the password is incorrect', async () => {
    await expect(
      useCase.execute({ email: 'jean@test.fr', password: 'WrongPassword1!', ip: '127.0.0.1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the user has no password', async () => {
    userAccountRepository.findPasswordByUserId.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ email: 'jean@test.fr', password: PASSWORD, ip: '127.0.0.1' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should return an access token and update the last connection', async () => {
    const result = await useCase.execute({ email: 'jean@test.fr', password: PASSWORD, ip: '10.0.0.1' });

    expect(result).toEqual({ accessToken: 'token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
    });
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.lastIp).toBe('10.0.0.1');
  });
});
