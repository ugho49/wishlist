import { Authorities } from '@wishlist/common-types';

export interface JwtPayload {
  id: string;
  sub: string; // TODO: deprecate this field in favor of id
  email: string;
  authorities: Authorities[];
}

export interface ICurrentUser {
  id: string;
  email: string;
  authorities: Authorities[];
}
