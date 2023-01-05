import { Box, Stack, TextField } from '@mui/material';
import { getUrlParameter, RouterLink, useApi, useToast } from '@wishlist/common-front';
import { useDispatch } from 'react-redux';
import React, { FormEvent, useState } from 'react';
import { setTokens } from '../../core/store/features';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { Card } from '../common/Card';
import { LoadingButton } from '@mui/lab';
import { InputLabel } from '../common/InputLabel';
import { Subtitle } from '../common/Subtitle';
import LoginIcon from '@mui/icons-material/Login';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { LoginOutputDto } from '@wishlist/common-types';

export const LoginPage = () => {
  const api = useApi(wishlistApiRef);
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [email, setEmail] = useState(getUrlParameter('email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (param: LoginOutputDto) => {
    addToast({ message: 'Heureux de vous revoir 🤓', variant: 'default' });

    dispatch(
      setTokens({
        accessToken: param.access_token,
        refreshToken: param.refresh_token,
      })
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      handleLoginSuccess(data);
    } catch (e) {
      addToast({
        message: (
          <>
            <span>Une erreur s'est produite. Vérifiez vos identifiants</span>&nbsp;<b>email / mot de passe</b>
          </>
        ),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      const data = await api.auth.loginWithGoogle({ credential: credentialResponse.credential || '' });
      handleLoginSuccess(data);
    } catch (e) {
      setLoading(false);
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    }
  };

  const onGoogleLoginFailure = () => {
    addToast({ message: "Une erreur s'est produite", variant: 'error' });
  };

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Connexion</Subtitle>
        <Stack component="form" onSubmit={onSubmit} gap={3}>
          <Box>
            <InputLabel required>Email</InputLabel>
            <TextField
              type="email"
              required
              fullWidth
              disabled={loading}
              placeholder="john@doe.fr"
              autoComplete="email"
              autoFocus={email === ''}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box>
            <InputLabel required>Mot de passe</InputLabel>
            <TextField
              required
              fullWidth
              placeholder="********"
              type="password"
              autoFocus={email !== ''}
              disabled={loading}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Stack alignItems="center" gap={2}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              color="secondary"
              loading={loading}
              loadingPosition="start"
              startIcon={<LoginIcon />}
              disabled={loading}
            >
              Me connecter
            </LoadingButton>
            <GoogleLogin
              onSuccess={onGoogleLoginSuccess}
              onError={onGoogleLoginFailure}
              text="signin_with"
              locale="fr"
            />
          </Stack>
        </Stack>
      </Card>
      <Stack sx={{ marginTop: '20px' }} gap={1} alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box>Pas encore inscrit ?</Box>
          <RouterLink to="/register">Inscription</RouterLink>
        </Stack>
        <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
      </Stack>
    </>
  );
};
