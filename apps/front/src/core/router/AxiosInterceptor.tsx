import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { useApi } from '@wishlist/common-front';
import { useInterval } from 'usehooks-ts';
import { AuthService } from '../services/auth.service';
import { logout } from '../store/features';
import { wishlistApiRef } from '../api/wishlist.api';

const mapState = (state: RootState) => ({ token: state.auth.token });
const authService = new AuthService();

export const AxiosInterceptor: React.FC = () => {
  const { token } = useSelector(mapState);
  const { axios } = useApi(wishlistApiRef);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const redirectToLogin = () => navigate('/login');

  // Check token expiration every seconds ->
  useInterval(() => {
    if (token && authService.tokenIsExpired(token)) {
      // TODO: TOAST "You have been disconnected"
      logout(dispatch);
      redirectToLogin();
    }
  }, 1000);

  useEffect(() => {
    if (token) {
      axios.setAuthorizationHeader(`Bearer ${token}`);
    } else {
      axios.removeAuthorizationHeader();
    }
  }, [axios, token]);

  return null;
};
