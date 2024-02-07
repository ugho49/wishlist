import React, { FormEvent, useState } from 'react';
import { RouterLink } from '../common/RouterLink';
import { Card } from '../common/Card';
import { Box, Stack, TextField } from '@mui/material';
import { Subtitle } from '../common/Subtitle';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { useNavigate } from 'react-router-dom';
import { useApi, useCustomSearchParams, useToast } from '@wishlist-front/hooks';

type SearchParamsType = {
  email?: string;
  token?: string;
};

export const RenewForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [queryParams] = useCustomSearchParams<SearchParamsType>();
  const { email, token } = queryParams;
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.user.validateResetPassword({
        email: email || '',
        token: token || '',
        new_password: password,
      });
      addToast({
        message: 'Le mot de passe à été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
        variant: 'success',
      });
      const searchParam = new URLSearchParams();
      searchParam.append('email', email || '');
      navigate({ pathname: '/login', search: searchParam.toString() });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      setLoading(false);
    }
  };

  if (!email || !token) {
    return <div>Cette url n'est pas valide</div>;
  }

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Mot de passe oublié</Subtitle>
        <Stack component="form" onSubmit={onSubmit} gap={3}>
          <Box>
            <InputLabel>Email</InputLabel>
            <TextField autoComplete="off" fullWidth value={email} inputProps={{ readOnly: true }} disabled />
          </Box>
          <Box>
            <InputLabel required>Nouveau mot de passe</InputLabel>
            <TextField
              required
              fullWidth
              placeholder="********"
              type="password"
              disabled={loading}
              autoComplete="new-password"
              value={password}
              helperText="8 caractères minimum"
              inputProps={{ maxLength: 50, minLength: 8 }}
              onChange={(e) => setPassword(e.target.value)}
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
            startIcon={<SaveAsIcon />}
            disabled={loading}
          >
            Changer mon mot de passe
          </LoadingButton>
        </Stack>
      </Card>
      <Stack sx={{ marginTop: '20px' }} gap={1} alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box>Déjà inscrit ?</Box>
          <RouterLink to="/login">Me connecter</RouterLink>
        </Stack>
      </Stack>
    </>
  );
};
