import type { AccessTokenJwtPayload } from '@wishlist/common';

import { jwtDecode } from 'jwt-decode';

export enum LS_KEYS {
  ACCESS_TOKEN = 'wl_v2_access_token',
  REFRESH_TOKEN = 'wl_v2_refresh_token',
}

export type TokenContent<T> = {
  rawToken: string;
  payload: T;
};

class AccessTokenService {
  constructor(private readonly STORAGE_KEY: string) {}

  getTokenFromLocalStorage = (): undefined | TokenContent<AccessTokenJwtPayload> => {
    const token = localStorage.getItem(this.STORAGE_KEY);
    if (!token) return undefined;
    try {
      const payload = jwtDecode(token) as AccessTokenJwtPayload;
      return {
        rawToken: token,
        payload,
      };
    } catch {
      return undefined;
    }
  };

  decodeToken = (token: string): AccessTokenJwtPayload => jwtDecode(token) as AccessTokenJwtPayload;

  isExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode(token) as { exp: number };
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  isExpiringWithin(token: string, ms: number): boolean {
    try {
      const { exp } = jwtDecode(token) as { exp: number };
      return Date.now() >= exp * 1000 - ms;
    } catch {
      return true;
    }
  }

  hasSessionId(token: string): boolean {
    try {
      return Boolean(this.decodeToken(token).sid);
    } catch {
      return false;
    }
  }

  isUsable(token: string): boolean {
    return this.hasSessionId(token) && !this.isExpired(token);
  }

  isLocalStorageTokenValid = (): boolean => {
    const token = this.getTokenFromLocalStorage();
    return token !== undefined && this.isUsable(token.rawToken);
  };

  storeTokenInLocalStorage = (token: string) => {
    localStorage.setItem(this.STORAGE_KEY, token);
  };

  removeTokenFromStorage = () => {
    localStorage.removeItem(this.STORAGE_KEY);
  };
}

class RefreshTokenService {
  constructor(private readonly STORAGE_KEY: string) {}

  getTokenFromLocalStorage = (): string | undefined => localStorage.getItem(this.STORAGE_KEY) ?? undefined;

  hasToken = (): boolean => Boolean(this.getTokenFromLocalStorage());

  storeTokenInLocalStorage = (token: string) => {
    localStorage.setItem(this.STORAGE_KEY, token);
  };

  removeTokenFromStorage = () => {
    localStorage.removeItem(this.STORAGE_KEY);
  };
}

export class AuthService {
  public readonly accessTokenService = new AccessTokenService(LS_KEYS.ACCESS_TOKEN);
  public readonly refreshTokenService = new RefreshTokenService(LS_KEYS.REFRESH_TOKEN);

  isAuthenticated = (): boolean =>
    this.accessTokenService.isLocalStorageTokenValid() || this.refreshTokenService.hasToken();
}
