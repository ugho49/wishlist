import React, { FormEvent, useEffect, useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import { useApi, useFetchUserInfo, useToast } from '@wishlist-front/hooks';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { Loader } from '../common/Loader';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { RootState } from '../../core';
import { AvatarUpdateButton } from './AvatarUpdateButton';
import { updatePicture as updatePictureAction, updateUser as updateUserAction } from '../../core/store/features';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateUserProfileInputDto, UserDto } from '@wishlist/common-types';

const mapState = (state: RootState) => state.userProfile.pictureUrl;

export const UserTabInformations = () => {
  const pictureUrl = useSelector(mapState);
  const theme = useTheme();
  const dispatch = useDispatch();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const api = useApi();
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const { addToast } = useToast();
  const { user, loading: loadingUser } = useFetchUserInfo();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstname(user.firstname);
      setLastname(user.lastname);
      setBirthday(user?.birthday ? DateTime.fromISO(user.birthday) : null);
    }
  }, [user]);

  const formIsValid = firstname.trim() !== '' && lastname.trim() !== '';

  const { mutateAsync: update, isPending: loading } = useMutation({
    mutationKey: ['user.update'],
    mutationFn: (data: UpdateUserProfileInputDto) => api.user.update(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_output, data) => {
      addToast({ message: 'Profil mis à jour', variant: 'info' });

      queryClient.setQueryData(['user'], (old: UserDto) => ({
        ...old,
        ...data,
        birthday: data.birthday ? DateTime.fromJSDate(data.birthday) : null,
      }));

      dispatch(updateUserAction({ firstName: data.firstname, lastName: data.lastname }));
    },
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await update({
      firstname,
      lastname,
      birthday: birthday !== null ? new Date(birthday.toISODate() || '') : undefined,
    });
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
              socials={user?.social || []}
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
            referenceDate={DateTime.now().minus({ year: 30 })}
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
