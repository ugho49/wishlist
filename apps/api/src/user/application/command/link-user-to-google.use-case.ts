import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { GoogleAuthService } from '@wishlist/api/auth'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserSocialType } from '@wishlist/common'

import {
  LinkUserToGoogleCommand,
  LinkUserToGoogleResult,
  UserRepository,
  UserSocial,
  UserSocialRepository,
} from '../../domain'
import { userMapper } from '../../infrastructure'

@CommandHandler(LinkUserToGoogleCommand)
export class LinkUserToGoogleUseCase implements IInferredCommandHandler<LinkUserToGoogleCommand> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: LinkUserToGoogleCommand): Promise<LinkUserToGoogleResult> {
    const { code, userId } = command

    let user = await this.userRepository.findByIdOrFail(userId)
    const socials = await this.userSocialRepository.findByUserId(userId)
    const googleSocial = socials.find(s => s.socialType === UserSocialType.GOOGLE)

    if (googleSocial) {
      throw new BadRequestException('User already linked to a Google Account')
    }

    const payload = await this.googleAuthService.getGoogleAccountFromCode(code)

    const existingSocial = await this.userSocialRepository.findBySocialId(payload.sub, UserSocialType.GOOGLE)

    if (existingSocial) {
      throw new BadRequestException('This Google Account is already linked to another user')
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified')
    }

    if (!payload.email) {
      throw new BadRequestException('Email is not given by Google')
    }

    const social = UserSocial.create({
      id: this.userSocialRepository.newId(),
      user,
      email: payload.email,
      name: payload.name,
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
      pictureUrl: payload.picture,
    })

    if (user.pictureUrl === undefined && payload.picture !== undefined) {
      user = user.updatePicture(payload.picture)
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx)
      await this.userSocialRepository.save(social, tx)
    })

    return userMapper.toUserSocialDto(social)
  }
}
