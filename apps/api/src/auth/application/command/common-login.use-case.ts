import type { JwtService } from '@nestjs/jwt'
import type { AccessTokenJwtPayload, Authorities, UserId } from '@wishlist/common'

export abstract class CommonLoginUseCase {
  constructor(private readonly jwtService: JwtService) {}

  public createAccessToken(params: { id: UserId; email: string; authorities: Authorities[] }): string {
    const { id, email, authorities } = params
    const payload: AccessTokenJwtPayload = {
      sub: id,
      email,
      authorities,
    }

    return this.jwtService.sign(payload)
  }
}
