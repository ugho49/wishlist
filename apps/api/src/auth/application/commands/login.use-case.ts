import type { ConfigType } from '@nestjs/config';
import type { UserRefreshTokenRepository } from '../../../user/domain/repository/user-refresh-token.repository';
import type { LoginOutput } from '../login.types';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { User } from '../../../user/domain/model/user.model';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { type UserAccountRepository } from '../../../user/domain/repository/user-account.repository';
import { UserAccountProvider } from '../../../user/domain/user-account-provider.enum';
import authConfig from '../../infrastructure/auth.config';
import { PasswordManager } from '../../infrastructure/util/password-manager';
import { CommonLoginUseCase } from './common-login.use-case';

export type LoginInput = {
  email: string;
  password: string;
  ip: string;
  userAgent?: string;
};

@Injectable()
export class LoginUseCase extends CommonLoginUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    refreshTokenRepository: UserRefreshTokenRepository,
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
    jwtService: JwtService,
  ) {
    super({
      jwtService,
      loggerName: LoginUseCase.name,
      refreshTokenRepository,
      refreshTokenDuration: config.refreshToken.duration,
    });
  }

  async execute(command: LoginInput): Promise<LoginOutput> {
    const { email, password, ip, userAgent } = command;
    this.logger.log('Login request received', { email });

    const user = await this.validateUserByEmailPassword(email, password);
    const tokens = await this.issueTokens({ user, ip, userAgent });

    this.logger.log('Login successful', { email });

    return tokens;
  }

  private async validateUserByEmailPassword(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Incorrect login');
    }

    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }

    const passwordAccount = await this.userAccountRepository.findByUserIdAndProvider(
      user.id,
      UserAccountProvider.PASSWORD,
    );

    if (!passwordAccount?.passwordHash) {
      throw new UnauthorizedException('Incorrect login');
    }

    const passwordVerified = await PasswordManager.verify({
      hash: passwordAccount.passwordHash,
      plainPassword: password,
    });

    if (!passwordVerified) {
      throw new UnauthorizedException('Incorrect login');
    }

    return user;
  }
}
