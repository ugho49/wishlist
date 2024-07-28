import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AccessTokenJwtPayload, createCurrentUserFromPayload } from '@wishlist/common-types'
import { ExtractJwt, Strategy } from 'passport-jwt'

import authConfig from '../auth.config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessToken.secret,
      algorithms: [config.accessToken.algorithm],
    })
  }

  validate(payload: AccessTokenJwtPayload) {
    return createCurrentUserFromPayload(payload)
  }
}
