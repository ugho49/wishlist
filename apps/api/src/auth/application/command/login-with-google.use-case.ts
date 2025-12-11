import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { User, UserCreatedEvent, UserRepository, UserSocial, UserSocialRepository } from '@wishlist/api/user'
import { UserSocialType } from '@wishlist/common'
import { TokenPayload } from 'google-auth-library'

import { LoginWithGoogleCommand, LoginWithGoogleResult } from '../../domain'
import { GoogleAuthService } from '../../infrastructure'
import { CommonLoginUseCase } from './common-login.use-case'

@CommandHandler(LoginWithGoogleCommand)
export class LoginWithGoogleUseCase
  extends CommonLoginUseCase
  implements IInferredCommandHandler<LoginWithGoogleCommand>
{
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
    jwtService: JwtService,
  ) {
    super({ jwtService, loggerName: LoginWithGoogleUseCase.name })
  }

  async execute(command: LoginWithGoogleCommand): Promise<LoginWithGoogleResult> {
    const { code, ip, createUserIfNotExists } = command
    this.logger.log('Login with Google request received', { code })
    const payload = await this.googleAuthService.getGoogleAccountFromCode(code)

    if (!payload.email) {
      throw new BadRequestException('Email is not given by Google')
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified')
    }

    const userSocial = await this.userSocialRepository.findBySocialId(payload.sub, UserSocialType.GOOGLE)

    if (userSocial) {
      return this.loginWithGoogleAndUpdate({ payload, ip, userSocial })
    }

    const user = await this.userRepository.findByEmail(payload.email)

    if (user) {
      return this.linkUserToGoogleAndLogin({ payload, ip, user })
    }

    if (!createUserIfNotExists) {
      throw new UnauthorizedException('User not found')
    }

    return this.createUserWithGoogleAndLogin({ payload, ip })
  }

  private async loginWithGoogleAndUpdate(params: {
    userSocial: UserSocial
    payload: TokenPayload
    ip: string
  }): Promise<LoginWithGoogleResult> {
    this.logger.log('Login with Google and update...')
    const { userSocial, payload, ip } = params
    const { user } = userSocial

    this.checkUserIsEnabled(user)

    let updatedUserSocial = userSocial.updateEmail(payload.email!).updateName(payload.name)
    let updatedUser = userSocial.user.updateLastConnection(ip)

    if (user.pictureUrl === userSocial.pictureUrl && payload.picture !== userSocial.pictureUrl) {
      updatedUser = updatedUser.updatePicture(payload.picture)
      updatedUserSocial = updatedUserSocial.updatePictureUrl(payload.picture)
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userSocialRepository.save(updatedUserSocial, tx)
      await this.userRepository.save(updatedUser, tx)
    })

    return { access_token: this.createAccessToken(updatedUser) }
  }

  private async createUserWithGoogleAndLogin(params: {
    payload: TokenPayload
    ip: string
  }): Promise<LoginWithGoogleResult> {
    const { payload, ip } = params
    this.logger.log('Creating user with Google and login...', { payload, ip })

    if (!payload.given_name) {
      throw new BadRequestException('Given name is not given by Google')
    }

    if (!payload.family_name) {
      throw new BadRequestException('Family name is not given by Google')
    }

    const user = User.create({
      id: this.userRepository.newId(),
      email: payload.email!,
      firstName: payload.given_name,
      lastName: payload.family_name,
      pictureUrl: payload.picture,
      ip,
    })

    const userSocial = UserSocial.create({
      id: this.userSocialRepository.newId(),
      user,
      email: payload.email!,
      name: payload.name,
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
      pictureUrl: payload.picture,
    })

    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx)
      await this.userSocialRepository.save(userSocial, tx)
    })

    await this.eventBus.publish(new UserCreatedEvent({ user }))

    return { access_token: this.createAccessToken(user), new_user_created: true }
  }

  private async linkUserToGoogleAndLogin(params: {
    user: User
    payload: TokenPayload
    ip: string
  }): Promise<LoginWithGoogleResult> {
    const { user, payload, ip } = params
    this.logger.log('Linking user to Google and login...', { user, payload, ip })

    this.checkUserIsEnabled(user)

    const userSocial = UserSocial.create({
      id: this.userSocialRepository.newId(),
      user,
      email: payload.email!,
      name: payload.name,
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
      pictureUrl: payload.picture,
    })

    let updatedUser = user.updateLastConnection(ip)

    if (user.pictureUrl === undefined) {
      updatedUser = user.updatePicture(payload.picture)
    }

    await this.transactionManager.runInTransaction(async tx => {
      await this.userSocialRepository.save(userSocial, tx)
      await this.userRepository.save(updatedUser, tx)
    })

    return { access_token: this.createAccessToken(updatedUser), linked_to_existing_user: true }
  }

  private checkUserIsEnabled(user: User) {
    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }
  }
}
