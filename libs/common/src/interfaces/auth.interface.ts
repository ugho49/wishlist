import type { UserId } from '../ids';

export interface AccessTokenJwtPayload {
  sub: UserId;
  email: string;
  authorities: string[];
}

export interface RefreshTokenJwtPayload {
  sub: UserId;
}

export interface ICurrentUser {
  id: UserId;
  email: string;
  authorities: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
