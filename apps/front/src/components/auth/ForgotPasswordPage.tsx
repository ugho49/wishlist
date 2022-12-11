import React, { FormEvent, useState } from 'react';
import { RouterLink, useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { Card } from '../common/Card';
import { Subtitle } from '../common/Subtitle';
import { Box, Stack, TextField } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';

export const ForgotPasswordPage = () => {
  const api = useApi(wishlistApiRef);
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.user.sendResetUserPasswordEmail({ email });
      addToast({ message: 'Un email vient de vous être envoyé pour réinitialiser le mot de passe', variant: 'info' });
      setResetCodeSent(true);
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ width: '100%' }}>
        {resetCodeSent && (
          <Box component="p" style={{ textAlign: 'center' }}>
            Un email 📩 vient de vous être envoyé pour réinitialiser le mot de passe. Aller regarder dans votre boite
            mail 😊
            <br />
            <br />
            <b>(Pensez aussi à regarder dans les spams)</b>
          </Box>
        )}
        {!resetCodeSent && (
          <>
            <Subtitle>Mot de passe oublié</Subtitle>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                startIcon={<AttachEmailIcon />}
                disabled={loading}
              >
                Réinitialisez mon mot de passe
              </LoadingButton>
            </Stack>
          </>
        )}
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
