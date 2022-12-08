import React, { FormEvent, useEffect, useState } from 'react';
import { UserDto } from '@wishlist/common-types';
import { Box, Stack, TextField } from '@mui/material';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { DateTime } from 'luxon';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { useAsync } from 'react-use';
import { Loader } from '../common/Loader';

export const UserTabInformations = () => {
  const api = useApi(wishlistApiRef);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { value, loading: loadingUser } = useAsync(() => api.user.getInfo(), []);

  useEffect(() => {
    if (value) {
      setEmail(value.email);
      setFirstname(value.firstname);
      setLastname(value.lastname);
      setBirthday(value?.birthday ? DateTime.fromISO(value.birthday) : null);
    }
  }, [value]);

  const formIsValid = firstname.trim() !== '' && lastname.trim() !== '';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.user.update({
        firstname,
        lastname,
        birthday: birthday !== null ? birthday.toJSDate() : undefined,
      });

      enqueueSnackbar('Profil mis à jour', { variant: 'info' });
    } catch (e) {
      enqueueSnackbar("Une erreur s'est produite", { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Loader loading={loadingUser}>
      <Stack component="form" onSubmit={onSubmit} noValidate gap={3}>
        <Box>
          <InputLabel required>Email</InputLabel>
          <TextField autoComplete="off" disabled={true} fullWidth value={email} inputProps={{ readOnly: true }} />
        </Box>

        <Box>
          <InputLabel required>Prénom</InputLabel>
          <TextField
            autoComplete="off"
            disabled={loading}
            fullWidth
            value={firstname}
            inputProps={{ maxLength: 50 }}
            placeholder="John"
            helperText={<CharsRemaining max={50} value={firstname} />}
            onChange={(e) => setFirstname(e.target.value)}
          />
        </Box>

        <Box>
          <InputLabel required>Nom</InputLabel>
          <TextField
            autoComplete="off"
            disabled={loading}
            fullWidth
            value={lastname}
            inputProps={{ maxLength: 50 }}
            placeholder="Doe"
            helperText={<CharsRemaining max={50} value={lastname} />}
            onChange={(e) => setLastname(e.target.value)}
          />
        </Box>

        <Stack>
          <InputLabel>Date de naissance</InputLabel>
          <MobileDatePicker
            inputFormat="DDD"
            value={birthday}
            disabled={loading}
            defaultCalendarMonth={DateTime.now().minus({ year: 30 })}
            onChange={(date) => setBirthday(date)}
            disableFuture={true}
            renderInput={(params) => <TextField {...params} placeholder="Renseigner votre date d'anniversaire" />}
          />
        </Stack>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="secondary"
          loading={loading}
          loadingPosition="start"
          disabled={loading || !formIsValid}
          startIcon={<SaveIcon />}
        >
          Enregistrer
        </LoadingButton>
      </Stack>
    </Loader>
  );
};
