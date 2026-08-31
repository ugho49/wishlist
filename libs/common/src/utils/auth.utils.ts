import type { AccessTokenJwtPayload, ICurrentUser } from '../interfaces/auth.interface';

export function createCurrentUserFromPayload(payload: AccessTokenJwtPayload): ICurrentUser {
  const authorities = payload.authorities;
  const isSuperAdmin = authorities.includes('ROLE_SUPERADMIN');
  const isAdmin = authorities.includes('ROLE_ADMIN') || isSuperAdmin;

  return {
    id: payload.sub,
    email: payload.email,
    authorities: authorities,
    isAdmin,
    isSuperAdmin,
    sessionId: payload.sid,
  };
}
