import jwt_decode from 'jwt-decode';
import { AccessTokenJwtPayload, RefreshTokenJwtPayload } from '@wishlist/common-types';

export enum LS_KEYS {
  ACCESS_TOKEN = 'wl_v2_access_token',
  REFRESH_TOKEN = 'wl_v2_refresh_token',
}

export type TokenContent<T> = {
  rawToken: string;
  payload: T;
};

export class AuthService {
  public readonly accessTokenService = new TokenService<AccessTokenJwtPayload>(LS_KEYS.ACCESS_TOKEN);
  public readonly refreshTokenService = new TokenService<RefreshTokenJwtPayload>(LS_KEYS.REFRESH_TOKEN);
}

class TokenService<T> {
  constructor(private readonly STORAGE_KEY: string) {}

  getTokenFromLocalStorage = (): undefined | TokenContent<T> => {
    const token = localStorage.getItem(this.STORAGE_KEY);
    if (!token) return undefined;
    try {
      const payload = jwt_decode(token) as T;
      return {
        rawToken: token,
        payload,
      };
    } catch (e) {
      return undefined;
    }
  };

  decodeToken = (token: string): T => {
    return jwt_decode(token) as T;
  };

  isExpired(token: string): boolean {
    try {
      const { exp } = jwt_decode(token) as any;
      return Date.now() >= exp * 1000;
    } catch (e) {
      return true;
    }
  }

  storeTokenInLocalStorage = (token: string) => {
    localStorage.setItem(this.STORAGE_KEY, token);
  };

  removeTokenFromStorage = () => {
    localStorage.removeItem(this.STORAGE_KEY);
  };
}
