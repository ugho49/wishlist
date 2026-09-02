import type { ConfigType } from '@nestjs/config';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { type AccessTokenJwtPayload, createCurrentUserFromPayload } from '@wishlist/common';
import { ExtractJwt, Strategy } from 'passport-jwt';

import authConfig from '../auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(authConfig.KEY) config: ConfigType<typeof authConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessToken.secret,
      algorithms: [config.accessToken.algorithm],
    });
  }

  validate(payload: AccessTokenJwtPayload) {
    if (!payload.sid) {
      throw new UnauthorizedException('Invalid token');
    }

    return createCurrentUserFromPayload(payload);
  }
}
