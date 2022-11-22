import { Authorities } from '@wishlist/common-types';

export interface AccessTokenJwtPayload {
  id: string;
  sub: string; // TODO: deprecate this field in favor of id
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
  hasAuthority: (authority: Authorities) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
