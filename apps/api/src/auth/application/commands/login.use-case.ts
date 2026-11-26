import type { UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import type { LoginOutput } from '../login.types';

import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';

import { User } from '../../../user/domain/model/user.model';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { type UserAccountRepository } from '../../../user/domain/repository/user-account.repository';
import { UserAccountProvider } from '../../../user/domain/user-account-provider.enum';
import { AuthConfig } from '../../infrastructure/auth.config';
import { TokenService } from '../../infrastructure/token.service';
import { PasswordManager } from '../../infrastructure/util/password-manager';
import { CommonLoginUseCase } from './common-login.use-case';

export type LoginInput = {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class LoginUseCase extends CommonLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    sessionRepository: UserSessionRepository,
    config: AuthConfig,
    tokenService: TokenService,
  ) {
    super({
      tokenService,
      loggerName: LoginUseCase.name,
      sessionRepository,
      refreshTokenDuration: config.refreshTokenDuration,
    });
  }

  async execute(command: LoginInput): Promise<LoginOutput> {
    const { email, password, ip, userAgent } = command;
    this.logger.info('Login request received', { email });

    const user = await this.validateUserByEmailPassword(email, password);
    const tokens = await this.issueTokens({ user, ip, userAgent });

    this.logger.info('Login successful', { email });

    return tokens;
  }

  /**
   * Every failure answers the same `Incorrect login` after a password check (a fake one without
   * account), so that neither the message nor the response time tells whether the email has an
   * account, or a disabled one.
   */
  private async validateUserByEmailPassword(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    const passwordAccount = user
      ? await this.userAccountRepository.findByUserIdAndProvider(user.id, UserAccountProvider.PASSWORD)
      : undefined;

    const passwordVerified = passwordAccount?.passwordHash
      ? await PasswordManager.verify({ hash: passwordAccount.passwordHash, plainPassword: password })
      : await PasswordManager.verifyWithoutHash(password);

    if (!user || !passwordVerified) {
      this.logger.info('Login refused', { email, reason: user ? 'wrong password or no password' : 'unknown email' });
      throw new UnauthorizedException('Incorrect login');
    }

    if (!user.isEnabled) {
      this.logger.info('Login refused', { email, reason: 'disabled user' });
      throw new UnauthorizedException('Incorrect login');
    }

    return user;
  }
}
