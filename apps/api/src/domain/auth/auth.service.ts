import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  AccessTokenJwtPayload,
  LoginInputDto,
  LoginOutputDto,
  LoginWithGoogleInputDto,
  RefreshTokenInputDto,
  RefreshTokenJwtPayload,
  RefreshTokenOutputDto,
  UserSocialType,
} from '@wishlist/common-types'
import { User, UserId, UserSocial } from '@wishlist/domain'

import { GoogleAuthService } from '../auth-social'
import { UserSocialRepository } from '../user/user-social.repository'
import { UserRepository } from '../user/user.repository'
import authConfig from './auth.config'
import { PasswordManager } from './util/password-manager'

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private userSocialRepository: UserSocialRepository,
    private googleAuthService: GoogleAuthService,
    private jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async login(dto: LoginInputDto, ip: string): Promise<LoginOutputDto> {
    const user = await this.validateUserByEmailAndPassword(dto.email, dto.password)

    return {
      refresh_token: this.createRefreshToken(user.id),
      access_token: await this.createAccessTokenAndUpdateUser(user, { ip }),
    }
  }

  async loginWithGoogle(dto: LoginWithGoogleInputDto, ip: string): Promise<LoginOutputDto> {
    const payload = await this.googleAuthService.verify(dto.credential)

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid')
    }

    let userSocial = await this.userSocialRepository.findBy({
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
    })
    let user: User
    let needUpdateProfilePicture = false

    if (!userSocial) {
      if (!payload.email_verified) {
        throw new UnauthorizedException('Email must be verified')
      }
      user = await this.checkUserExistByEmail(payload.email ?? '')
      userSocial = new UserSocial({
        id: UserSocial.getNewId(),
        externalProviderId: payload.sub,
        socialType: UserSocialType.GOOGLE,
        pictureUrl: payload.picture,
        userId: user.id,
      })
      await this.userSocialRepository.insert(userSocial)
      if (!user.pictureUrl) needUpdateProfilePicture = true
    } else {
      user = await this.checkUserExistById(userSocial.userId)
      if (user.pictureUrl === userSocial.pictureUrl && payload.picture !== userSocial.pictureUrl) {
        needUpdateProfilePicture = true
        await this.userSocialRepository.update(userSocial.id, { picture_url: payload.picture })
      }
    }

    return {
      refresh_token: this.createRefreshToken(user.id),
      access_token: await this.createAccessTokenAndUpdateUser(user, {
        ip,
        pictureUrl: needUpdateProfilePicture ? payload.picture : undefined,
      }),
    }
  }

  async refresh(dto: RefreshTokenInputDto, ip: string): Promise<RefreshTokenOutputDto> {
    const refreshPayload = this.validateRefreshToken(dto.token)
    const user = await this.userRepository.findById(refreshPayload.sub)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }

    return {
      access_token: await this.createAccessTokenAndUpdateUser(user, { ip }),
    }
  }

  private async createAccessTokenAndUpdateUser(
    user: User,
    newValues: {
      ip: string
      pictureUrl?: string
    },
  ): Promise<string> {
    const payload: AccessTokenJwtPayload = {
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
    }

    const token = this.jwtService.sign(payload)

    await this.userRepository.update(user.id, {
      picture_url: newValues.pictureUrl,
      last_ip: newValues.ip,
      last_connected_at: new Date(),
    })

    return token
  }

  private createRefreshToken(userId: UserId): string {
    const payload: RefreshTokenJwtPayload = { sub: userId }

    return this.jwtService.sign(payload, {
      secret: this.config.refreshToken.secret,
      expiresIn: this.config.refreshToken.duration,
      algorithm: this.config.refreshToken.algorithm,
    })
  }

  private validateRefreshToken(token: string): RefreshTokenJwtPayload {
    try {
      return this.jwtService.verify<RefreshTokenJwtPayload>(token, {
        secret: this.config.refreshToken.secret,
      })
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  private async checkUserExistById(id: UserId): Promise<User> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new UnauthorizedException('Incorrect login')
    }

    this.checkUserIsEnabled(user)

    return user
  }

  private async checkUserExistByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Incorrect login')
    }

    this.checkUserIsEnabled(user)

    return user
  }

  private async validateUserByEmailAndPassword(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Incorrect login')
    }

    this.checkUserIsEnabled(user)

    const passwordVerified = await PasswordManager.verify({
      hash: user.passwordEnc ?? undefined,
      plainPassword: password,
    })

    if (!passwordVerified) {
      throw new UnauthorizedException('Incorrect login')
    }

    return user
  }

  private checkUserIsEnabled(user: User): void {
    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }
  }
}
