import { Box, Grid, Stack, TextField } from '@mui/material';
import { RouterLink, useApi, useToast } from '@wishlist/common-front';
import { useDispatch } from 'react-redux';
import React, { FormEvent, useState } from 'react';
import { setTokens } from '../../core/store/features';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { LoginInputDto } from '@wishlist/common-types';
import { Card } from '../common/Card';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { InputLabel } from '../common/InputLabel';

export const LoginPage = () => {
  const api = useApi(wishlistApiRef);
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [form, setForm] = useState<LoginInputDto>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.auth.login(form);
      addToast({ message: 'Heureux de vous revoir 🤓', variant: 'default' });

      dispatch(
        setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        })
      );
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

  return (
    <>
      <Card sx={{ width: '100%' }}>
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
              autoFocus
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Box>
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="secondary"
            loading={loading}
            loadingPosition="start"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            Connexion
          </LoadingButton>
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
