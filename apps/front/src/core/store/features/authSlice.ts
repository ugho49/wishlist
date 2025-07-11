import type { PayloadAction } from '@reduxjs/toolkit'
import type { ICurrentUser } from '@wishlist/common'

import { createSlice } from '@reduxjs/toolkit'
import { createCurrentUserFromPayload } from '@wishlist/common'

import { AuthService } from '../../services/auth.service'

const authService = new AuthService()
const accessTokenService = authService.accessTokenService
const refreshTokenService = authService.refreshTokenService

export interface AuthState {
  user?: ICurrentUser
  accessToken?: string
  refreshToken?: string
}

const initUser = (): ICurrentUser | undefined => {
  const value = accessTokenService.getTokenFromLocalStorage()
  if (!value) return undefined
  return createCurrentUserFromPayload(value.payload)
}

const initialState: AuthState = {
  user: initUser(),
  accessToken: accessTokenService.getTokenFromLocalStorage()?.rawToken,
  refreshToken: refreshTokenService.getTokenFromLocalStorage()?.rawToken,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      const { accessToken, refreshToken } = action.payload
      accessTokenService.storeTokenInLocalStorage(accessToken)
      refreshTokenService.storeTokenInLocalStorage(refreshToken)
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.user = createCurrentUserFromPayload(accessTokenService.decodeToken(accessToken))
    },
    resetAuthState: state => {
      accessTokenService.removeTokenFromStorage()
      refreshTokenService.removeTokenFromStorage()
      state.user = undefined
      state.accessToken = undefined
      state.refreshToken = undefined
    },
  },
})

export const { setTokens, resetAuthState } = authSlice.actions
