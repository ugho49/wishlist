import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { USER_REPOSITORY, USER_SOCIAL_REPOSITORY } from '@wishlist/api/repositories'
import { User, UserRepository, UserSocial, UserSocialRepository } from '@wishlist/api/user'
import {
  AccessTokenJwtPayload,
  LoginInputDto,
  LoginOutputDto,
  LoginWithGoogleInputDto,
  RefreshTokenInputDto,
  RefreshTokenJwtPayload,
  RefreshTokenOutputDto,
  UserId,
  UserSocialType,
} from '@wishlist/common'

import authConfig from './auth.config'
import { GoogleAuthService } from './social'
import { PasswordManager } from './util/password-manager'

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SOCIAL_REPOSITORY)
    private readonly userSocialRepository: UserSocialRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async login(dto: LoginInputDto, ip: string): Promise<LoginOutputDto> {
    const user = await this.validateUserByEmailPassword(dto.email, dto.password)

    return {
      access_token: await this.createAccessTokenAndUpdateUser({ user, ip }),
      refresh_token: this.createRefreshToken(user.id),
    }
  }

  async loginWithGoogle(dto: LoginWithGoogleInputDto, ip: string): Promise<LoginOutputDto> {
    const payload = await this.googleAuthService.verify(dto.credential)

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid')
    }

    let userSocial = await this.userSocialRepository.findBySocialId(payload.sub, UserSocialType.GOOGLE)
    let user = userSocial?.user ?? (await this.validateUserByEmail(payload.email || ''))

    if (!userSocial) {
      if (!payload.email_verified) {
        throw new UnauthorizedException('Email must be verified')
      }

      userSocial = UserSocial.create({
        id: this.userSocialRepository.newId(),
        user,
        socialId: payload.sub,
        socialType: UserSocialType.GOOGLE,
        pictureUrl: payload.picture,
      })

      if (!user.pictureUrl) {
        user = user.updatePicture(payload.picture)
      }
    } else {
      if (user.pictureUrl === userSocial.pictureUrl && payload.picture !== userSocial.pictureUrl) {
        user = user.updatePicture(payload.picture)
      }

      userSocial = userSocial.updatePictureUrl(payload.picture)
    }

    await this.userSocialRepository.save(userSocial)

    return {
      access_token: await this.createAccessTokenAndUpdateUser({ user, ip }),
      refresh_token: this.createRefreshToken(user.id),
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
      access_token: await this.createAccessTokenAndUpdateUser({ user, ip }),
    }
  }

  private async createAccessTokenAndUpdateUser(params: { user: User; ip: string }): Promise<string> {
    const { user, ip } = params
    const payload: AccessTokenJwtPayload = {
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
    }

    const token = this.jwtService.sign(payload)

    const updatedUser = user.updateLastConnection(ip)

    await this.userRepository.save(updatedUser)

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

  private async validateUserByEmailPassword(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email).then(this.checkUserExistAndEnabled)

    const passwordVerified = await PasswordManager.verify({
      hash: user.passwordEnc || undefined,
      plainPassword: password,
    })

    if (!passwordVerified) {
      throw new UnauthorizedException('Incorrect login')
    }

    return user
  }

  private validateUserByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email).then(this.checkUserExistAndEnabled)
  }

  private validateUserById(id: UserId): Promise<User> {
    return this.userRepository.findById(id).then(this.checkUserExistAndEnabled)
  }

  private checkUserExistAndEnabled(user?: User): User {
    if (!user) {
      throw new UnauthorizedException('Incorrect login')
    }

    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }

    return user
  }
}
