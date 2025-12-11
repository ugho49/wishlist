import type { JwtService } from '@nestjs/jwt'
import type { AccessTokenJwtPayload, Authorities, UserId } from '@wishlist/common'

import { Logger } from '@nestjs/common'

export abstract class CommonLoginUseCase {
  protected readonly logger: Logger

  private readonly jwtService: JwtService

  constructor(params: { jwtService: JwtService; loggerName: string }) {
    this.logger = new Logger(params.loggerName)
    this.jwtService = params.jwtService
  }

  public createAccessToken(params: { id: UserId; email: string; authorities: Authorities[] }): string {
    const { id, email, authorities } = params
    this.logger.log('Creating access token...', { id, email, authorities })
    const payload: AccessTokenJwtPayload = {
      sub: id,
      email,
      authorities,
    }

    return this.jwtService.sign(payload)
  }
}
