import type { PayloadAction } from '@reduxjs/toolkit';
import type { ICurrentUser } from '@wishlist/common';

import { createSlice } from '@reduxjs/toolkit';
import { createCurrentUserFromPayload } from '@wishlist/common';

import { AuthService } from '../../services/auth.service';

const authService = new AuthService();
const accessTokenService = authService.accessTokenService;
const refreshTokenService = authService.refreshTokenService;

export interface AuthState {
  user?: ICurrentUser;
  accessToken?: string;
}

const readInitialAccessToken = () => {
  const stored = accessTokenService.getTokenFromLocalStorage();
  if (!stored) return;

  if (accessTokenService.isUsable(stored.rawToken) || refreshTokenService.hasToken()) {
    return stored;
  }

  accessTokenService.removeTokenFromStorage();
  return;
};

const initialAccessToken = readInitialAccessToken();

const initialState: AuthState = {
  user: initialAccessToken ? createCurrentUserFromPayload(initialAccessToken.payload) : undefined,
  accessToken: initialAccessToken?.rawToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      const { accessToken, refreshToken } = action.payload;
      accessTokenService.storeTokenInLocalStorage(accessToken);
      refreshTokenService.storeTokenInLocalStorage(refreshToken);
      state.accessToken = accessToken;
      state.user = createCurrentUserFromPayload(accessTokenService.decodeToken(accessToken));
    },
    resetAuthState: state => {
      accessTokenService.removeTokenFromStorage();
      refreshTokenService.removeTokenFromStorage();
      state.user = undefined;
      state.accessToken = undefined;
    },
  },
});

export const { setTokens, resetAuthState } = authSlice.actions;
