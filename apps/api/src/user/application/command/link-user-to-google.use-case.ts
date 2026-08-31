import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { GoogleAuthService } from '../../../auth/infrastructure/social/google-auth.service';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAccount } from '../../domain/model/user-account.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';

export type LinkUserToGoogleInput = {
  code: string;
  userId: UserId;
};

export type LinkUserToGoogleOutput = {
  userAccount: UserAccount;
};

@Injectable()
export class LinkUserToGoogleUseCase {
  private readonly logger = new Logger(LinkUserToGoogleUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: LinkUserToGoogleInput): Promise<LinkUserToGoogleOutput> {
    this.logger.log('Link user to Google request received', { input });
    const { code, userId } = input;

    let user = await this.userRepository.findByIdOrFail(userId);
    const accounts = await this.userAccountRepository.findByUserId(userId);
    const googleAccount = accounts.find(item => item.provider === UserAccountProvider.GOOGLE);

    if (googleAccount) {
      throw new BadRequestException('User already linked to a Google Account');
    }

    const payload = await this.googleAuthService.getGoogleAccountFromCode(code);

    const existingAccount = await this.userAccountRepository.findByProviderAccountId(
      payload.sub,
      UserAccountProvider.GOOGLE,
    );

    if (existingAccount) {
      throw new BadRequestException('This Google Account is already linked to another user');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified');
    }

    if (!payload.email) {
      throw new BadRequestException('Email is not given by Google');
    }

    const account = UserAccount.createSocial({
      id: this.userAccountRepository.newId(),
      user,
      email: payload.email,
      provider: UserAccountProvider.GOOGLE,
      providerAccountId: payload.sub,
      pictureUrl: payload.picture,
    });

    if (user.pictureUrl === undefined && payload.picture !== undefined) {
      this.logger.log('Updating user picture from Google', { userId, picture: payload.picture });
      user = user.updatePicture(payload.picture);
    }

    this.logger.log('Saving user and account...', { userId });
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx);
      await this.userAccountRepository.save(account, tx);
    });

    return { userAccount: account };
  }
}
