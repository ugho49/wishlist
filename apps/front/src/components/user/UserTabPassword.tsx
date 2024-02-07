import React, { FormEvent, useState } from 'react';
import { useApi, useToast } from '@wishlist-front/hooks';
import { Alert, Box, Stack, TextField } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';

export const UserTabPassword = () => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { addToast } = useToast();

  const formIsValid =
    oldPassword.trim() !== '' && newPassword.trim() !== '' && newPassword.length >= 8 && oldPassword !== newPassword;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.user.changePassword({
        new_password: newPassword,
        old_password: oldPassword,
      });

      setNewPassword('');
      setOldPassword('');

      addToast({ message: 'Mot de passe mis à jour', variant: 'info' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack component="form" onSubmit={onSubmit} noValidate gap={3}>
      {oldPassword !== '' && newPassword !== '' && oldPassword === newPassword && (
        <Alert severity="warning">Le nouveau mot de passe doit être différent de l'ancien</Alert>
      )}
      <Box>
        <InputLabel required>Ancien mot de passe</InputLabel>
        <TextField
          type="password"
          autoComplete="off"
          disabled={loading}
          fullWidth
          value={oldPassword}
          placeholder="********"
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </Box>
      <Box>
        <InputLabel required>Nouveau mot de passe</InputLabel>
        <TextField
          type="password"
          autoComplete="off"
          disabled={loading}
          fullWidth
          value={newPassword}
          inputProps={{ maxLength: 50 }}
          placeholder="********"
          error={newPassword.length > 0 && newPassword.length < 8}
          helperText="8 caractères minimum"
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Box>
      <Stack direction="row" justifyContent="center">
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          color="secondary"
          loading={loading}
          loadingPosition="start"
          disabled={loading || !formIsValid}
          startIcon={<SaveIcon />}
        >
          Mettre à jour
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
