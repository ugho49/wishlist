import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { USER_REPOSITORY, USER_SOCIAL_REPOSITORY } from '@wishlist/api/repositories'
import {
  LegacyUserRepository,
  LegacyUserSocialRepository,
  UserEntity,
  UserRepository,
  UserSocialEntity,
  UserSocialRepository,
} from '@wishlist/api/user'
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
    private readonly legacyUserRepository: LegacyUserRepository,
    private readonly legacyUserSocialRepository: LegacyUserSocialRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async login(user: LoginInputDto, ip: string): Promise<LoginOutputDto> {
    const userEntity = await this.validateUserByEmailPassword(user.email, user.password)

    return {
      refresh_token: this.createRefreshToken(userEntity.id),
      access_token: await this.createAccessTokenAndUpdateUser(userEntity, { ip }),
    }
  }

  async loginWithGoogle(dto: LoginWithGoogleInputDto, ip: string): Promise<LoginOutputDto> {
    const payload = await this.googleAuthService.verify(dto.credential)

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid')
    }

    let userSocial = await this.legacyUserSocialRepository.findOneBy({
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
    })
    let userEntity
    let needUpdateProfilePicture = false

    if (!userSocial) {
      if (!payload.email_verified) {
        throw new UnauthorizedException('Email must be verified')
      }
      userEntity = await this.validateUserByEmail(payload.email || '')
      userSocial = UserSocialEntity.create({
        userId: userEntity.id,
        socialId: payload.sub,
        socialType: UserSocialType.GOOGLE,
        pictureUrl: payload.picture,
      })
      await this.legacyUserSocialRepository.insert(userSocial)
      if (!userEntity.pictureUrl) needUpdateProfilePicture = true
    } else {
      userEntity = await this.validateUserById(userSocial.userId)
      if (userEntity.pictureUrl === userSocial.pictureUrl && payload.picture !== userSocial.pictureUrl)
        needUpdateProfilePicture = true
      await this.legacyUserSocialRepository.update(
        { id: userSocial.id },
        {
          pictureUrl: payload.picture,
        },
      )
    }

    return {
      refresh_token: this.createRefreshToken(userEntity.id),
      access_token: await this.createAccessTokenAndUpdateUser(userEntity, {
        ip,
        pictureUrl: needUpdateProfilePicture ? payload.picture : undefined,
      }),
    }
  }

  async refresh(dto: RefreshTokenInputDto, ip: string): Promise<RefreshTokenOutputDto> {
    const refreshPayload = this.validateRefreshToken(dto.token)
    const userEntity = await this.legacyUserRepository.findById(refreshPayload.sub)

    if (!userEntity) {
      throw new UnauthorizedException('User not found')
    }

    if (!userEntity.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }

    return {
      access_token: await this.createAccessTokenAndUpdateUser(userEntity, { ip }),
    }
  }

  private async createAccessTokenAndUpdateUser(
    userEntity: UserEntity,
    newValues: {
      ip: string
      pictureUrl?: string
    },
  ): Promise<string> {
    const payload: AccessTokenJwtPayload = {
      sub: userEntity.id,
      email: userEntity.email,
      authorities: userEntity.authorities,
    }

    const token = this.jwtService.sign(payload)

    await this.legacyUserRepository.updateById(userEntity.id, {
      pictureUrl: newValues.pictureUrl,
      lastIp: newValues.ip,
      lastConnectedAt: new Date(),
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

  private async validateUserByEmailPassword(email: string, password: string): Promise<UserEntity> {
    const user = await this.legacyUserRepository.findByEmail(email).then(this.checkUserExistAndEnabled)

    const passwordVerified = await PasswordManager.verify({
      hash: user.passwordEnc || undefined,
      plainPassword: password,
    })

    if (!passwordVerified) {
      throw new UnauthorizedException('Incorrect login')
    }

    return user
  }

  private validateUserByEmail(email: string): Promise<UserEntity> {
    return this.legacyUserRepository.findByEmail(email).then(this.checkUserExistAndEnabled)
  }

  private validateUserById(id: UserId): Promise<UserEntity> {
    return this.legacyUserRepository.findById(id).then(this.checkUserExistAndEnabled)
  }

  private checkUserExistAndEnabled(user: UserEntity | null): UserEntity {
    if (!user) {
      throw new UnauthorizedException('Incorrect login')
    }

    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }

    return user
  }
}
