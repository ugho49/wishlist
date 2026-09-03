import type { UserId, UserSessionId } from '../ids';

export interface AccessTokenJwtPayload {
  sub: UserId;
  email: string;
  authorities: string[];
  sid?: UserSessionId;
}

export interface ICurrentUser {
  id: UserId;
  email: string;
  authorities: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  sessionId?: UserSessionId;
}
