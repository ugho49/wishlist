import type { LoginOutput } from '../login.types';

import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { type TokenPayload } from 'google-auth-library';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserCreatedEvent } from '../../../user/domain/event/user-created.event';
import { User } from '../../../user/domain/model/user.model';
import { UserAccount } from '../../../user/domain/model/user-account.model';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { type UserAccountRepository } from '../../../user/domain/repository/user-account.repository';
import { UserAccountProvider } from '../../../user/domain/user-account-provider.enum';
import { GoogleAuthService } from '../../infrastructure/social/google-auth.service';
import { CommonLoginUseCase } from './common-login.use-case';

export type LoginWithGoogleInput = {
  code: string;
  ip: string;
  createUserIfNotExists: boolean;
};

@Injectable()
export class LoginWithGoogleUseCase extends CommonLoginUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
    jwtService: JwtService,
  ) {
    super({ jwtService, loggerName: LoginWithGoogleUseCase.name });
  }

  async execute(command: LoginWithGoogleInput): Promise<LoginOutput> {
    const { code, ip, createUserIfNotExists } = command;
    this.logger.log('Login with Google request received', { code });
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
      return this.loginWithGoogleAndUpdate({ payload, ip, userAccount });
    }

    const user = await this.userRepository.findByEmail(payload.email);

    if (user) {
      return this.linkUserToGoogleAndLogin({ payload, ip, user });
    }

    if (!createUserIfNotExists) {
      throw new UnauthorizedException('User not found');
    }

    return this.createUserWithGoogleAndLogin({ payload, ip });
  }

  private async loginWithGoogleAndUpdate(params: {
    userAccount: UserAccount;
    payload: TokenPayload;
    ip: string;
  }): Promise<LoginOutput> {
    this.logger.log('Login with Google and update...');
    const { userAccount, payload, ip } = params;
    const { user } = userAccount;

    this.checkUserIsEnabled(user);

    let updatedUserAccount = userAccount.updateEmail(payload.email!);
    let updatedUser = userAccount.user.updateLastConnection(ip);

    if (user.pictureUrl === userAccount.pictureUrl && payload.picture !== userAccount.pictureUrl) {
      updatedUser = updatedUser.updatePicture(payload.picture);
      updatedUserAccount = updatedUserAccount.updatePictureUrl(payload.picture);
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userAccountRepository.save(updatedUserAccount, tx);
      await this.userRepository.save(updatedUser, tx);
    });

    return { accessToken: this.createAccessToken(updatedUser) };
  }

  private async createUserWithGoogleAndLogin(params: { payload: TokenPayload; ip: string }): Promise<LoginOutput> {
    const { payload, ip } = params;
    this.logger.log('Creating user with Google and login...', { payload, ip });

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
      ip,
    });

    const userAccount = UserAccount.createSocial({
      id: this.userAccountRepository.newId(),
      user,
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

    return { accessToken: this.createAccessToken(user), newUserCreated: true };
  }

  private async linkUserToGoogleAndLogin(params: {
    user: User;
    payload: TokenPayload;
    ip: string;
  }): Promise<LoginOutput> {
    const { user, payload, ip } = params;
    this.logger.log('Linking user to Google and login...', { user, payload, ip });

    this.checkUserIsEnabled(user);

    const userAccount = UserAccount.createSocial({
      id: this.userAccountRepository.newId(),
      user,
      email: payload.email!,
      provider: UserAccountProvider.GOOGLE,
      providerAccountId: payload.sub,
      pictureUrl: payload.picture,
    });

    let updatedUser = user.updateLastConnection(ip);

    if (user.pictureUrl === undefined) {
      updatedUser = user.updatePicture(payload.picture);
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userAccountRepository.save(userAccount, tx);
      await this.userRepository.save(updatedUser, tx);
    });

    return { accessToken: this.createAccessToken(updatedUser), linkedToExistingUser: true };
  }

  private checkUserIsEnabled(user: User) {
    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }
  }
}
