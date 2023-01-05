import { Card } from '../common/Card';
import { Box, Stack, TextField } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import { RouterLink, useApi, useToast } from '@wishlist/common-front';
import React, { FormEvent, useState } from 'react';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useDispatch } from 'react-redux';
import { Subtitle } from '../common/Subtitle';
import { CharsRemaining } from '../common/CharsRemaining';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { setTokens } from '../../core/store/features';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { LoginOutputDto } from '@wishlist/common-types';

export const RegisterPage = () => {
  const api = useApi(wishlistApiRef);
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSuccess = (param: LoginOutputDto) => {
    addToast({ message: 'Bienvenue sur wishlist 👋', variant: 'default' });

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
      await api.user.register({
        email,
        firstname,
        lastname,
        password,
      });
      const data = await api.auth.login({ email, password });
      handleRegisterSuccess(data);
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      setLoading(false);
    }
  };

  const onGoogleRegisterSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    try {
      await api.user.registerWithGoogle({ credential: credentialResponse.credential || '' });
      const data = await api.auth.loginWithGoogle({ credential: credentialResponse.credential || '' });
      handleRegisterSuccess(data);
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      setLoading(false);
    }
  };

  const onGoogleRegisterFailure = () => {
    addToast({ message: "Une erreur s'est produite", variant: 'error' });
  };

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Inscription</Subtitle>
        <Stack component="form" onSubmit={onSubmit} gap={3}>
          <Stack direction="row" flexWrap="wrap" gap={3}>
            <Box sx={{ flexGrow: 1 }}>
              <InputLabel required>Prénom</InputLabel>
              <TextField
                required
                disabled={loading}
                fullWidth
                value={firstname}
                autoFocus
                inputProps={{ maxLength: 50 }}
                placeholder="John"
                autoComplete="given-name"
                helperText={<CharsRemaining max={50} value={firstname} />}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <InputLabel required>Nom</InputLabel>
              <TextField
                required
                disabled={loading}
                fullWidth
                value={lastname}
                inputProps={{ maxLength: 50 }}
                placeholder="Doe"
                autoComplete="family-name"
                helperText={<CharsRemaining max={50} value={lastname} />}
                onChange={(e) => setLastname(e.target.value)}
              />
            </Box>
          </Stack>

          <Box>
            <InputLabel required>Email</InputLabel>
            <TextField
              type="email"
              required
              fullWidth
              disabled={loading}
              placeholder="john@doe.fr"
              autoComplete="email"
              value={email}
              inputProps={{ maxLength: 200 }}
              helperText={<CharsRemaining max={200} value={email} />}
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
              disabled={loading}
              autoComplete="new-password"
              helperText="8 caractères minimum"
              value={password}
              inputProps={{ maxLength: 50, minLength: 8 }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Stack alignItems="center" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              color="secondary"
              loading={loading}
              loadingPosition="start"
              startIcon={<PersonAddIcon />}
              disabled={loading}
            >
              M'inscrire
            </LoadingButton>
            <GoogleLogin
              onSuccess={onGoogleRegisterSuccess}
              onError={onGoogleRegisterFailure}
              text="signup_with"
              locale="fr"
            />
          </Stack>
        </Stack>
      </Card>
      <Stack sx={{ marginTop: '20px' }} gap={1} alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box>Déjà inscrit ?</Box>
          <RouterLink to="/login">Me connecter</RouterLink>
        </Stack>
        <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
      </Stack>
    </>
  );
};
