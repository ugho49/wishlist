import React, { FormEvent, useEffect, useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { DateTime } from 'luxon';
import { useDispatch } from 'react-redux';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { useAsync } from 'react-use';
import { Loader } from '../common/Loader';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { AvatarUpdateButton } from './AvatarUpdateButton';
import { updatePicture as updatePictureAction } from '../../core/store/features';

const mapState = (state: RootState) => ({ pictureUrl: state.userProfile.pictureUrl });

export const UserTabInformations = () => {
  const { pictureUrl } = useSelector(mapState);
  const theme = useTheme();
  const dispatch = useDispatch();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const api = useApi(wishlistApiRef);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const { addToast } = useToast();
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
        birthday: birthday !== null ? new Date(birthday.toISODate() || '') : undefined,
      });

      addToast({ message: 'Profil mis à jour', variant: 'info' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Loader loading={loadingUser}>
      <Stack component="form" onSubmit={onSubmit} noValidate gap={smallScreen ? 2 : 3}>
        <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 2 : 3}>
          <Stack justifyContent="center" alignItems="center" sx={smallScreen ? { width: '100%' } : undefined}>
            <AvatarUpdateButton
              firstname={firstname}
              lastname={lastname}
              pictureUrl={pictureUrl}
              socials={value?.social || []}
              onPictureUpdated={(pictureUrl) => dispatch(updatePictureAction(pictureUrl))}
              uploadPictureHandler={api.user.uploadPicture}
              updatePictureFromSocialHandler={api.user.updatePictureFromSocial}
              deletePictureHandler={api.user.deletePicture}
            />
          </Stack>
          <Box sx={{ flexGrow: 1 }}>
            <InputLabel>Email</InputLabel>
            <TextField
              autoComplete="off"
              disabled={true}
              fullWidth
              value={email}
              inputProps={{ readOnly: true }}
              helperText="Ce champ n'est pas modifiable pour le moment"
            />
          </Box>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 2 : 3}>
          <Box sx={{ flexGrow: 1 }}>
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

          <Box sx={{ flexGrow: 1 }}>
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
        </Stack>

        <Stack>
          <InputLabel>Date de naissance</InputLabel>
          <MobileDatePicker
            value={birthday}
            disabled={loading}
            defaultCalendarMonth={DateTime.now().minus({ year: 30 })}
            onChange={(date) => setBirthday(date)}
            disableFuture={true}
          />
        </Stack>

        <Stack direction="row" justifyContent="center">
          <LoadingButton
            sx={{ marginTop: '20px' }}
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
    </Loader>
  );
};
