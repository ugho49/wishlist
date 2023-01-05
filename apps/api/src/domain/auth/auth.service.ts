import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user';
import { JwtService } from '@nestjs/jwt';
import { PasswordManager } from './util/password-manager';
import {
  LoginInputDto,
  LoginOutputDto,
  RefreshTokenInputDto,
  RefreshTokenOutputDto,
  AccessTokenJwtPayload,
  RefreshTokenJwtPayload,
  LoginWithGoogleInputDto,
  UserSocialType,
} from '@wishlist/common-types';
import authConfig from './auth.config';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import { GoogleAuthService } from '../auth-social';
import { UserSocialRepository } from '../user/user-social.repository';
import { UserSocialEntity } from '../user/user-social.entity';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private userSocialRepository: UserSocialRepository,
    private googleAuthService: GoogleAuthService,
    private jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>
  ) {}

  async login(user: LoginInputDto, ip: string): Promise<LoginOutputDto> {
    const userEntity = await this.validateUser(user.email, 'email', user.password);

    return {
      refresh_token: this.createRefreshToken(userEntity.id),
      access_token: await this.createAccessTokenAndUpdateUser(userEntity, { ip }),
    };
  }

  async loginWithGoogle(dto: LoginWithGoogleInputDto, ip: string): Promise<LoginOutputDto> {
    const payload = await this.googleAuthService.verify(dto.credential);

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid');
    }

    let userSocial = await this.userSocialRepository.findOneBy({
      socialId: payload.sub,
      socialType: UserSocialType.GOOGLE,
    });
    let userEntity;

    if (!userSocial) {
      if (!payload.email_verified) {
        throw new UnauthorizedException('Email must be verified');
      }
      userEntity = await this.validateUser(payload.email || '', 'email');
      userSocial = UserSocialEntity.create({
        userId: userEntity.id,
        socialId: payload.sub,
        socialType: UserSocialType.GOOGLE,
        pictureUrl: payload.picture,
      });
      await this.userSocialRepository.insert(userSocial);
    } else {
      userEntity = await this.validateUser(userSocial.userId, 'id');
      await this.userSocialRepository.update(
        { id: userSocial.id },
        {
          pictureUrl: payload.picture,
        }
      );
    }

    return {
      refresh_token: this.createRefreshToken(userEntity.id),
      access_token: await this.createAccessTokenAndUpdateUser(userEntity, { ip, pictureUrl: payload.picture }),
    };
  }

  async refresh(dto: RefreshTokenInputDto, ip: string): Promise<RefreshTokenOutputDto> {
    const refreshPayload = this.validateRefreshToken(dto.token);
    const userEntity = await this.userRepository.findById(refreshPayload.sub);

    if (!userEntity) {
      throw new UnauthorizedException('User not found');
    }

    if (!userEntity.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }

    return {
      access_token: await this.createAccessTokenAndUpdateUser(userEntity, { ip }),
    };
  }

  private async createAccessTokenAndUpdateUser(
    userEntity: UserEntity,
    newValues: {
      ip: string;
      pictureUrl?: string;
    }
  ): Promise<string> {
    const payload: AccessTokenJwtPayload = {
      sub: userEntity.id,
      email: userEntity.email,
      authorities: userEntity.authorities,
    };

    const token = this.jwtService.sign(payload);

    await this.userRepository.updateById(userEntity.id, {
      pictureUrl: newValues.pictureUrl,
      lastIp: newValues.ip,
      lastConnectedAt: new Date(),
    });

    return token;
  }

  private createRefreshToken(userId: string): string {
    const payload: RefreshTokenJwtPayload = { sub: userId };

    return this.jwtService.sign(payload, {
      secret: this.config.refreshToken.secret,
      expiresIn: this.config.refreshToken.duration,
      algorithm: this.config.refreshToken.algorithm,
    });
  }

  private validateRefreshToken(token: string): RefreshTokenJwtPayload {
    try {
      return this.jwtService.verify<RefreshTokenJwtPayload>(token, {
        secret: this.config.refreshToken.secret,
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async validateUser(id: string, type: 'email' | 'id', password?: string): Promise<UserEntity> {
    const user = await (type === 'email' ? this.userRepository.findByEmail(id) : this.userRepository.findById(id));

    if (!user) {
      throw new UnauthorizedException('Incorrect login');
    }

    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }

    if (password) {
      const passwordVerified = await PasswordManager.verify(user.passwordEnc, password);

      if (!passwordVerified) {
        throw new UnauthorizedException('Incorrect login');
      }
    }

    return user;
  }
}
