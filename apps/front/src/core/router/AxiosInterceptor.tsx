import React, { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useInterval } from 'usehooks-ts';
import { AuthService } from '../services/auth.service';
import { useApi, useLogout, useToast } from '@wishlist-front/hooks';

const mapAuthState = (state: RootState) => state.auth;
const accessTokenService = new AuthService().accessTokenService;

export const AxiosInterceptor: React.FC = () => {
  const { accessToken } = useSelector(mapAuthState);
  const api = useApi();
  const { addToast } = useToast();
  const logout = useLogout();

  const checkTokenExpiration = useCallback(async () => {
    // TODO change this to refreshToken -->
    if (accessToken && accessTokenService.isExpired(accessToken)) {
      // TODO get new accessToken from refreshToken when expired
      addToast({ message: 'Votre session à expiré', variant: 'warning' });
      await logout();
    }
  }, [accessToken, addToast, logout]);

  useEffect(() => {
    void checkTokenExpiration();
  }, [checkTokenExpiration]);

  // Check token expiration every seconds ->
  useInterval(() => {
    void checkTokenExpiration();
  }, 1000);

  useEffect(() => {
    if (accessToken) {
      api.setAccessToken(accessToken);
    } else {
      api.removeUserToken();
    }
  }, [api, accessToken]);

  return null;
};
