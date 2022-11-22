import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity, UserService } from '../user';
import { JwtService } from '@nestjs/jwt';
import { PasswordManager } from './util/password-manager';
import { AccessTokenJwtPayload, RefreshTokenJwtPayload } from './auth.interface';
import { LoginInputDto, LoginOutputDto, RefreshTokenInputDto, RefreshTokenOutputDto } from '@wishlist/common-types';
import authConfig from './auth.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
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
    const userEntity = await this.usersService.findEntityById(refreshPayload.sub);

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
      id: userEntity.id,
      email: userEntity.email,
      sub: userEntity.id,
      authorities: userEntity.authorities,
    };

    const token = this.jwtService.sign(payload);

    await this.usersService.updateLogin(userEntity.id, {
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
    const user = await this.usersService.findEntityByEmail(email);

    if (user && !user.isEnabled) {
      throw new UnauthorizedException('User is disabled');
    }

    if (user && (await PasswordManager.verify(user.passwordEnc, password))) {
      return user;
    }

    throw new UnauthorizedException('Incorrect login');
  }
}
