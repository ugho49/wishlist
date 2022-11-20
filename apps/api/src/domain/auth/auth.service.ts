import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity, UserService } from '../user';
import { JwtService } from '@nestjs/jwt';
import { PasswordManager } from './util/password-manager';
import { JwtPayload } from './auth.interface';
import { LoginInputDto, LoginOutputDto } from '@wishlist/common-types';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService, private jwtService: JwtService) {}

  async login(user: LoginInputDto): Promise<LoginOutputDto> {
    const userEntity = await this.validateUser(user.email, user.password);
    const payload: JwtPayload = {
      id: userEntity.id,
      email: user.email,
      sub: userEntity.id,
      authorities: userEntity.authorities,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findEntityByEmail(email);
    if (user && user.isEnabled && (await PasswordManager.verify(user.passwordEnc, password))) {
      return user;
    }
    throw new UnauthorizedException('Incorrect login');
  }
}
