import type { AccessTokenJwtPayload } from '@wishlist/common'

import { jwtDecode } from 'jwt-decode'

export enum LS_KEYS {
  ACCESS_TOKEN = 'wl_v2_access_token',
}

export type TokenContent<T> = {
  rawToken: string
  payload: T
}

export class AuthService {
  public readonly accessTokenService = new TokenService<AccessTokenJwtPayload>(LS_KEYS.ACCESS_TOKEN)
}

class TokenService<T> {
  constructor(private readonly STORAGE_KEY: string) {}

  getTokenFromLocalStorage = (): undefined | TokenContent<T> => {
    const token = localStorage.getItem(this.STORAGE_KEY)
    if (!token) return undefined
    try {
      const payload = jwtDecode(token) as T
      return {
        rawToken: token,
        payload,
      }
    } catch {
      return undefined
    }
  }

  decodeToken = (token: string): T => {
    return jwtDecode(token) as T
  }

  isExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode(token) as { exp: number }
      return Date.now() >= exp * 1000
    } catch {
      return true
    }
  }

  isLocalStorageTokenValid = (): boolean => {
    const token = this.getTokenFromLocalStorage()
    return token !== undefined && !this.isExpired(token.rawToken)
  }

  storeTokenInLocalStorage = (token: string) => {
    localStorage.setItem(this.STORAGE_KEY, token)
  }

  removeTokenFromStorage = () => {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
