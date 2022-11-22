import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from '../auth.config';
import { ConfigType } from '@nestjs/config';
import { ICurrentUser, AccessTokenJwtPayload } from '../auth.interface';
import { Authorities } from '@wishlist/common-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessToken.secret,
      algorithms: [config.accessToken.algorithm],
    });
  }

  validate(payload: AccessTokenJwtPayload): ICurrentUser {
    const authorities = payload.authorities;
    const hasAuthority = (authority: Authorities) => authorities.includes(authority);
    const isSuperAdmin = hasAuthority(Authorities.ROLE_SUPERADMIN);
    const isAdmin = hasAuthority(Authorities.ROLE_ADMIN) || isSuperAdmin;

    return {
      id: payload.id,
      email: payload.email,
      authorities: authorities,
      hasAuthority,
      isAdmin,
      isSuperAdmin,
    };
  }
}
