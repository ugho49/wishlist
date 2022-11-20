import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/user.entity';
import { PasswordManager } from './util/password-manager';
import { LoginInputDto, LoginOutputDto } from './auth.dto';
import { JwtPayload } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService, private jwtService: JwtService) {}

  async login(user: LoginInputDto): Promise<LoginOutputDto> {
    const userEntity = await this.validateUser(user.email, user.password);
    const payload: JwtPayload = { id: userEntity.id, email: user.email, sub: userEntity.id, authorities: [] }; // TODO: add authorities
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findEntityByEmail(email);
    if (user && (await PasswordManager.verify(user.passwordEnc, password))) {
      return user;
    }
    throw new UnauthorizedException('Incorrect login');
  }
}
