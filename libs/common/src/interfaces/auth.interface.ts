import type { Authorities } from '../enums'
import type { UserId } from '../ids'

export interface AccessTokenJwtPayload {
  sub: UserId
  email: string
  authorities: Authorities[]
}

export interface RefreshTokenJwtPayload {
  sub: UserId
}

export interface ICurrentUser {
  id: UserId
  email: string
  authorities: Authorities[]
  isAdmin: boolean
  isSuperAdmin: boolean
}
