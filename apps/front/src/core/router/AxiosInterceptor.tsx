import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { useToast } from '@wishlist/common-front';
import { useInterval } from 'usehooks-ts';
import { AuthService } from '../services/auth.service';
import { logout } from '../store/features';
import { useApi } from '@wishlist-front/hooks';

const mapState = (state: RootState) => ({ accessToken: state.auth.accessToken });
const accessTokenService = new AuthService().accessTokenService;

export const AxiosInterceptor: React.FC = () => {
  const { accessToken } = useSelector(mapState);
  const api = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const redirectToLogin = useCallback(() => navigate('/login'), [navigate]);

  const checkTokenExpiration = useCallback(() => {
    // TODO change this to refreshToken -->
    if (accessToken && accessTokenService.isExpired(accessToken)) {
      // TODO get new accessToken from refreshToken when expired
      addToast({ message: 'Votre session à expiré', variant: 'warning' });
      logout(dispatch);
      redirectToLogin();
    }
  }, [accessToken, addToast, dispatch, redirectToLogin]);

  useEffect(() => {
    checkTokenExpiration();
  }, [checkTokenExpiration]);

  // Check token expiration every seconds ->
  useInterval(() => {
    checkTokenExpiration();
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
