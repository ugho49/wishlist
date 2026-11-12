import type { UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import type { LoginOutput } from '../login.types';

import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException, UnauthorizedException } from '@znight/http';
import { type TokenPayload } from 'google-auth-library';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { UserCreatedEvent } from '../../../user/domain/event/user-created.event';
import { User } from '../../../user/domain/model/user.model';
import { UserAccount } from '../../../user/domain/model/user-account.model';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { type UserAccountRepository } from '../../../user/domain/repository/user-account.repository';
import { UserAccountProvider } from '../../../user/domain/user-account-provider.enum';
import { AuthConfig } from '../../infrastructure/auth.config';
import { GoogleAuthService } from '../../infrastructure/social/google-auth.service';
import { TokenService } from '../../infrastructure/token.service';
import { CommonLoginUseCase } from './common-login.use-case';

export type LoginWithGoogleInput = {
  code: string;
  ip?: string;
  userAgent?: string;
  createUserIfNotExists: boolean;
};

@Injectable()
export class LoginWithGoogleUseCase extends CommonLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    sessionRepository: UserSessionRepository,
    config: AuthConfig,
    private readonly googleAuthService: GoogleAuthService,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventPublisher,
    tokenService: TokenService,
  ) {
    super({
      tokenService,
      loggerName: LoginWithGoogleUseCase.name,
      sessionRepository,
      refreshTokenDuration: config.refreshTokenDuration,
    });
  }

  async execute(command: LoginWithGoogleInput): Promise<LoginOutput> {
    const { code, ip, userAgent, createUserIfNotExists } = command;
    this.logger.info('Login with Google request received', { code });
    const payload = await this.googleAuthService.getGoogleAccountFromCode(code);

    if (!payload.email) {
      throw new BadRequestException('Email is not given by Google');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified');
    }

    const userAccount = await this.userAccountRepository.findByProviderAccountId(
      payload.sub,
      UserAccountProvider.GOOGLE,
    );

    if (userAccount) {
      return this.loginWithGoogleAndUpdate({ payload, ip, userAgent, userAccount });
    }

    const user = await this.userRepository.findByEmail(payload.email);

    if (user) {
      return this.linkUserToGoogleAndLogin({ payload, ip, userAgent, user });
    }

    if (!createUserIfNotExists) {
      throw new UnauthorizedException('User not found');
    }

    return this.createUserWithGoogleAndLogin({ payload, ip, userAgent });
  }

  private async loginWithGoogleAndUpdate(params: {
    userAccount: UserAccount;
    payload: TokenPayload;
    ip?: string;
    userAgent?: string;
  }): Promise<LoginOutput> {
    this.logger.info('Login with Google and update...');
    const { userAccount, payload, ip, userAgent } = params;
    const user = await this.userRepository.findByIdOrFail(userAccount.userId);

    this.checkUserIsEnabled(user);

    let updatedUserAccount = userAccount.updateEmail(payload.email!);
    let updatedUser = user;

    if (user.pictureUrl === userAccount.pictureUrl && payload.picture !== userAccount.pictureUrl) {
      updatedUser = updatedUser.updatePicture(payload.picture);
      updatedUserAccount = updatedUserAccount.updatePictureUrl(payload.picture);
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userAccountRepository.save(updatedUserAccount, tx);
      if (updatedUser !== user) {
        await this.userRepository.save(updatedUser, tx);
      }
    });

    const tokens = await this.issueTokens({ user: updatedUser, ip, userAgent });
    return tokens;
  }

  private async createUserWithGoogleAndLogin(params: {
    payload: TokenPayload;
    ip?: string;
    userAgent?: string;
  }): Promise<LoginOutput> {
    const { payload, ip, userAgent } = params;
    this.logger.info('Creating user with Google and login...', { payload, ip });

    if (!payload.given_name) {
      throw new BadRequestException('Given name is not given by Google');
    }

    if (!payload.family_name) {
      throw new BadRequestException('Family name is not given by Google');
    }

    const user = User.create({
      id: this.userRepository.newId(),
      email: payload.email!,
      firstName: payload.given_name,
      lastName: payload.family_name,
      pictureUrl: payload.picture,
    });

    const userAccount = UserAccount.createSocialAccount({
      id: this.userAccountRepository.newId(),
      userId: user.id,
      email: payload.email!,
      provider: UserAccountProvider.GOOGLE,
      providerAccountId: payload.sub,
      pictureUrl: payload.picture,
    });

    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx);
      await this.userAccountRepository.save(userAccount, tx);
    });

    await this.eventBus.publish(new UserCreatedEvent({ user }));

    const tokens = await this.issueTokens({ user, ip, userAgent });
    return { ...tokens, newUserCreated: true };
  }

  private async linkUserToGoogleAndLogin(params: {
    user: User;
    payload: TokenPayload;
    ip?: string;
    userAgent?: string;
  }): Promise<LoginOutput> {
    const { user, payload, ip, userAgent } = params;
    this.logger.info('Linking user to Google and login...', { user, payload, ip });

    this.checkUserIsEnabled(user);

    const userAccount = UserAccount.createSocialAccount({
      id: this.userAccountRepository.newId(),
      userId: user.id,
      email: payload.email!,
      provider: UserAccountProvider.GOOGLE,
      providerAccountId: payload.sub,
      pictureUrl: payload.picture,
    });

    let updatedUser = user;

    if (user.pictureUrl === undefined) {
      updatedUser = user.updatePicture(payload.picture);
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userAccountRepository.save(userAccount, tx);
      if (updatedUser !== user) {
        await this.userRepository.save(updatedUser, tx);
      }
    });

    const tokens = await this.issueTokens({ user: updatedUser, ip, userAgent });
    return { ...tokens, linkedToExistingUser: true };
  }

  private checkUserIsEnabled(user: User) {
    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }
  }
}
