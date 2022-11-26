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
} from '@wishlist/common-types';
import authConfig from './auth.config';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>
  ) {}

  async login(user: LoginInputDto, ip: string): Promise<LoginOutputDto> {
    const userEntity = await this.validateUser(user.email, user.password);

    return {
      refresh_token: this.createRefreshToken(userEntity.id),
      access_token: await this.createAccessToken(userEntity, ip),
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
      access_token: await this.createAccessToken(userEntity, ip),
    };
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

  private async createAccessToken(userEntity: UserEntity, ip: string): Promise<string> {
    const payload: AccessTokenJwtPayload = {
      sub: userEntity.id,
      email: userEntity.email,
      authorities: userEntity.authorities,
    };

    const token = this.jwtService.sign(payload);

    await this.userRepository.updateById(userEntity.id, {
      lastIp: ip,
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

  private async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);

    if (user && !user.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }

    if (user && (await PasswordManager.verify(user.passwordEnc, password))) {
      return user;
    }

    throw new UnauthorizedException('Incorrect login');
  }
}
