import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { useApi } from '@wishlist/common-front';
import { useInterval } from 'usehooks-ts';
import { AuthService } from '../services/auth.service';
import { logout } from '../store/features';
import { wishlistApiRef } from '../api/wishlist.api';
import { useSnackbar } from 'notistack';

const mapState = (state: RootState) => ({ accessToken: state.auth.accessToken });
const accessTokenService = new AuthService().accessTokenService;

export const AxiosInterceptor: React.FC = () => {
  const { accessToken } = useSelector(mapState);
  const { axios } = useApi(wishlistApiRef);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const redirectToLogin = () => navigate('/login');

  // TODO get new accessToken from refreshToken when expired

  // Check token expiration every seconds ->
  useInterval(() => {
    // TODO change this to refreshToken -->
    if (accessToken && accessTokenService.isExpired(accessToken)) {
      enqueueSnackbar('Votre session à expiré', { variant: 'warning' });
      logout(dispatch);
      redirectToLogin();
    }
  }, 1000);

  useEffect(() => {
    if (accessToken) {
      axios.setAuthorizationHeader(`Bearer ${accessToken}`);
    } else {
      axios.removeAuthorizationHeader();
    }
  }, [axios, accessToken]);

  return null;
};
