import { Authorities } from '../enums';

export interface AccessTokenJwtPayload {
  sub: string;
  email: string;
  authorities: Authorities[];
}

export interface RefreshTokenJwtPayload {
  sub: string;
}

export interface ICurrentUser {
  id: string;
  email: string;
  authorities: Authorities[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
