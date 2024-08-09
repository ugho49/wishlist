import { Authorities } from '../enums/index.js'
import { AccessTokenJwtPayload, ICurrentUser } from '../interfaces/index.js'

export function createCurrentUserFromPayload(payload: AccessTokenJwtPayload): ICurrentUser {
  const authorities = payload.authorities
  const hasAuthority = (authority: Authorities) => authorities.includes(authority)
  const isSuperAdmin = hasAuthority(Authorities.ROLE_SUPERADMIN)
  const isAdmin = hasAuthority(Authorities.ROLE_ADMIN) || isSuperAdmin

  return {
    id: payload.sub,
    email: payload.email,
    authorities: authorities,
    isAdmin,
    isSuperAdmin,
  }
}
