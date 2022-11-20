export interface JwtPayload {
  id: string;
  sub: string; // TODO: deprecate this field in favor of id
  email: string;
  authorities: string[];
}

export interface ICurrentUser {
  id: string;
  email: string;
  authorities: string[];
}
