import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { type UserId, UserSocialDto, UserSocialType } from '@wishlist/common';

import { GoogleAuthService } from '../../../auth/infrastructure/social/google-auth.service';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserSocial } from '../../domain/model/user-social.model';
import { userMapper } from '../../infrastructure/user.mapper';

export type LinkUserToGoogleInput = {
  code: string;
  userId: UserId;
};

@Injectable()
export class LinkUserToGoogleUseCase {
  private readonly logger = new Logger(LinkUserToGoogleUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: LinkUserToGoogleInput): Promise<UserSocialDto> {
    this.logger.log('Link user to Google request received', { input });
    const { code, userId } = input;

    let user = await this.userRepository.findByIdOrFail(userId);
    const socials = await this.userSocialRepository.findByUserId(userId);
    const googleSocial = socials.find(s => s.socialType === UserSocialType.GOOGLE);

    if (googleSocial) {
      throw new BadRequestException('User already linked to a Google Account');
    }

    const payload = await this.googleAuthService.getGoogleAccountFromCode(code);

    const existingSocial = await this.userSocialRepository.findBySocialId(payload.sub, UserSocialType.GOOGLE);

    if (existingSocial) {
      throw new BadRequestException('This Google Account is already linked to another user');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified');
    }

    if (!payload.email) {
      throw new BadRequestException('Email is not given by Google');
    }

    const social = UserSocial.create({
      id: this.userSocialRepository.newId(),
      user,
      email: payload.email,
      name: payload.name,
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
      pictureUrl: payload.picture,
    });

    if (user.pictureUrl === undefined && payload.picture !== undefined) {
      this.logger.log('Updating user picture from Google', { userId, picture: payload.picture });
      user = user.updatePicture(payload.picture);
    }

    this.logger.log('Saving user and social...', { userId });
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx);
      await this.userSocialRepository.save(social, tx);
    });

    return userMapper.toUserSocialDto(social);
  }
}
