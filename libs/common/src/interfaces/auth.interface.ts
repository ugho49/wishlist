import type { UserId, UserRefreshTokenId } from '../ids';

export interface AccessTokenJwtPayload {
  sub: UserId;
  email: string;
  authorities: string[];
  sid?: UserRefreshTokenId;
}

export interface ICurrentUser {
  id: UserId;
  email: string;
  authorities: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  sessionId?: UserRefreshTokenId;
}
