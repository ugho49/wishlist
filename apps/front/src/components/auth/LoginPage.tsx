import { Alert, Box, Stack, TextField } from '@mui/material';
import { getUrlParameter, RouterLink, useToast } from '@wishlist/common-front';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { setTokens } from '../../core/store/features';
import { Card } from '../common/Card';
import { LoadingButton } from '@mui/lab';
import { InputLabel } from '../common/InputLabel';
import { Subtitle } from '../common/Subtitle';
import LoginIcon from '@mui/icons-material/Login';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { LoginOutputDto } from '@wishlist/common-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useApi } from '@wishlist-front/hooks';

const schema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(1, { message: '1 caractère minimum' }),
});

type FormFields = z.infer<typeof schema>;

export const LoginPage = () => {
  const api = useApi();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [socialLoading, setSocialLoading] = useState(false);
  const {
    register,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      email: getUrlParameter('email') || '',
      password: '',
    },
  });

  const handleLoginSuccess = (param: LoginOutputDto) => {
    addToast({ message: 'Heureux de vous revoir 🤓', variant: 'default' });

    dispatch(
      setTokens({
        accessToken: param.access_token,
        refreshToken: param.refresh_token,
      }),
    );
  };

  const onSubmit = async (data: FormFields) => {
    try {
      const result = await api.auth.login(data);
      handleLoginSuccess(result);
    } catch (e) {
      if (e instanceof AxiosError && (e.response?.status === 401 || e.response?.status === 403)) {
        setError('root', { message: 'Email ou mot de passe incorrect' });
      } else {
        setError('root', { message: "Une erreur s'est produite." });
      }
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setSocialLoading(true);
      const data = await api.auth.loginWithGoogle({ credential: credentialResponse.credential || '' });
      handleLoginSuccess(data);
    } catch (e) {
      setSocialLoading(false);
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    }
  };

  const onGoogleLoginFailure = () => {
    setSocialLoading(false);
    addToast({ message: "Une erreur s'est produite", variant: 'error' });
  };

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Connexion</Subtitle>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
          {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

          <Box>
            <InputLabel required>Email</InputLabel>
            <TextField
              {...register('email')}
              type="email"
              fullWidth
              placeholder="Entrer l'email que vous avez utilisé lors de l'inscription"
              autoComplete="email"
              error={!!formErrors.email}
              helperText={formErrors.email?.message}
            />
          </Box>
          <Box>
            <InputLabel required>Mot de passe</InputLabel>
            <TextField
              {...register('password')}
              type="password"
              fullWidth
              placeholder="Mon mot de passe"
              autoComplete="current-password"
              error={!!formErrors.password}
              helperText={formErrors.password?.message}
            />
          </Box>
          <Stack alignItems="center" gap={2}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              color="secondary"
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={<LoginIcon />}
              disabled={isSubmitting || socialLoading}
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
