import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { GoogleAuthService } from '@wishlist/api/auth'
import { TransactionManager } from '@wishlist/api/core'
import { USER_REPOSITORY, USER_SOCIAL_REPOSITORY } from '@wishlist/api/repositories'
import { UserSocialType } from '@wishlist/common'

import {
  CreateUserFromGoogleCommand,
  CreateUserResult,
  User,
  UserCreatedEvent,
  UserRepository,
  UserSocial,
  UserSocialRepository,
} from '../../domain'
import { userMapper } from '../../infrastructure'

@CommandHandler(CreateUserFromGoogleCommand)
export class CreateUserFromGoogleUseCase implements IInferredCommandHandler<CreateUserFromGoogleCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SOCIAL_REPOSITORY)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly transactionManager: TransactionManager,
    private readonly googleAuthService: GoogleAuthService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserFromGoogleCommand): Promise<CreateUserResult> {
    const { credential, ip } = command

    const payload = await this.googleAuthService.verify(credential)

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid')
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified')
    }

    if (!payload.email) {
      throw new BadRequestException('Email is not given by Google')
    }

    if (!payload.given_name) {
      throw new BadRequestException('First name is not given by Google')
    }

    if (!payload.family_name) {
      throw new BadRequestException('Last name is not given by Google')
    }

    const user = User.create({
      id: this.userRepository.newId(),
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      passwordEnc: undefined,
      ip,
    })

    const social = UserSocial.create({
      id: this.userSocialRepository.newId(),
      user,
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
      pictureUrl: payload.picture,
    })

    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx)
      await this.userSocialRepository.save(social, tx)
    })

    await this.eventBus.publish(new UserCreatedEvent({ user }))

    return userMapper.toMiniUserDto(user)
  }
}
