import type React from 'react';
import type { RootState } from '../store';

import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useInterval } from 'usehooks-ts';

import { useLogout } from '../../hooks/useLogout';
import { useToast } from '../../hooks/useToast';
import { AuthService } from '../services/auth.service';
import { refreshSessionTokens } from '../services/session-refresh';

const mapAuthState = (state: RootState) => state.auth;
const authService = new AuthService();
const REFRESH_BEFORE_EXPIRY_MS = 60_000;
const CHECK_INTERVAL_MS = 5_000;

export const SessionWatcher: React.FC = () => {
  const { accessToken } = useSelector(mapAuthState);
  const { addToast } = useToast();
  const logout = useLogout();

  const expireSession = useCallback(async () => {
    addToast({ message: 'Votre session a expiré', variant: 'warning' });
    await logout();
  }, [addToast, logout]);

  const checkTokenExpiration = useCallback(async () => {
    const refreshToken = authService.refreshTokenService.getTokenFromLocalStorage();

    if (
      accessToken &&
      authService.accessTokenService.hasSessionId(accessToken) &&
      !authService.accessTokenService.isExpiringWithin(accessToken, REFRESH_BEFORE_EXPIRY_MS)
    ) {
      return;
    }

    if (!refreshToken) {
      if (accessToken) await expireSession();
      return;
    }

    const nextAccessToken = await refreshSessionTokens();
    if (!nextAccessToken) {
      await expireSession();
    }
  }, [accessToken, expireSession]);

  useEffect(() => {
    void checkTokenExpiration();
  }, [checkTokenExpiration]);

  useInterval(() => {
    void checkTokenExpiration();
  }, CHECK_INTERVAL_MS);

  return null;
};
