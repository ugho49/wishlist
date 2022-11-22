import jwt_decode from 'jwt-decode';

export enum LS_KEYS {
  ACCESS_TOKEN = 'baby_tracker_access_token',
}

export class AuthService {
  getAccessTokenFromLocalStorage = (): string | undefined => {
    const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN);
    if (!token) {
      return undefined;
    }
    try {
      jwt_decode(token);
    } catch (e) {
      console.error(e);
      return undefined;
    }
    return token;
  };

  tokenIsExpired(token: string): boolean {
    try {
      const { exp } = jwt_decode(token) as any;
      return Date.now() >= exp * 1000;
    } catch (e) {
      return true;
    }
  }

  storeAccessTokenInLocalStorage = (token: string) => {
    localStorage.setItem(LS_KEYS.ACCESS_TOKEN, token);
  };

  removeAccessToken = () => {
    localStorage.removeItem(LS_KEYS.ACCESS_TOKEN);
  };
}
