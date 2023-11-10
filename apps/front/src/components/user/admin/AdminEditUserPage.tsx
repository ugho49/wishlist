import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Stack, TextField } from '@mui/material';
import React, { FormEvent, useEffect, useState } from 'react';
import { Loader } from '../../common/Loader';
import { Title } from '../../common/Title';
import { useAsync } from 'react-use';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../../core/api/wishlist.api';
import { useParams } from 'react-router-dom';
import { InputLabel } from '../../common/InputLabel';
import { DateTime } from 'luxon';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { CharsRemaining } from '../../common/CharsRemaining';
import { Card } from '../../common/Card';
import { Subtitle } from '../../common/Subtitle';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import { ConfirmButton } from '../../common/ConfirmButton';
import { RootState } from '../../../core';
import { useSelector } from 'react-redux';
import { UpdatePasswordModal } from './UpdatePasswordModal';
import { AvatarUpdateButton } from '../AvatarUpdateButton';

const mapState = (state: RootState) => ({ currentUser: state.auth.user });

export const AdminEditUserPage = () => {
  const { addToast } = useToast();
  const { currentUser } = useSelector(mapState);
  const params = useParams<'userId'>();
  const userId = params.userId || '';
  const api = useApi(wishlistApiRef);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const { value, loading: loadingUser } = useAsync(() => api.user.admin.getById(userId), [userId]);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const [updatePasswordModalOpen, setUpdatePasswordModalOpen] = useState(false);

  const isCurrentUser = currentUser?.id === userId;

  useEffect(() => {
    if (value) {
      setEmail(value.email);
      setFirstname(value.firstname);
      setLastname(value.lastname);
      setBirthday(value?.birthday ? DateTime.fromISO(value.birthday) : null);
      setEnabled(value.is_enabled);
      setPictureUrl(value.picture_url || '');
    }
  }, [value]);

  const disableUser = async () => {
    setLoading(true);
    setEnabled(false);
    try {
      await api.user.admin.update(userId, { is_enabled: false });
      addToast({ message: 'Utilisateur désactivé', variant: 'success' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const enableUser = async () => {
    setLoading(true);
    setEnabled(true);
    try {
      await api.user.admin.update(userId, { is_enabled: true });
      addToast({ message: 'Utilisateur activé', variant: 'success' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.user.admin.update(userId, {
        firstname,
        lastname,
        birthday: birthday !== null ? new Date(birthday.toISODate() || '') : undefined,
        email,
      });

      addToast({ message: 'Profil mis à jour', variant: 'success' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Loader loading={loadingUser}>
      <Box>
        <Title smallMarginBottom goBackLink={{ title: 'Retour', to: '/admin?tab=users' }}>
          Editer l'utilisateur
        </Title>

        <UpdatePasswordModal
          userId={userId}
          open={updatePasswordModalOpen}
          onClose={() => setUpdatePasswordModalOpen(false)}
        />

        <Card>
          <Subtitle>Détails</Subtitle>
          <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <AvatarUpdateButton
                    size="30px"
                    firstname={firstname}
                    lastname={lastname}
                    pictureUrl={pictureUrl}
                    socials={[]}
                    onPictureUpdated={(url) => setPictureUrl(url || '')}
                    uploadPictureHandler={(file) => api.user.admin.uploadPicture(userId, file)}
                    updatePictureFromSocialHandler={() => Promise.resolve()}
                    deletePictureHandler={() => api.user.admin.deletePicture(userId)}
                  />
                </ListItemIcon>
                <ListItemText primary={`${firstname} ${lastname}`} secondary={email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Inscrit le"
                  secondary={DateTime.fromISO(value?.created_at || '').toLocaleString(
                    DateTime.DATETIME_MED_WITH_SECONDS,
                  )}
                />
              </ListItem>
            </List>

            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dernière connexion le"
                  secondary={DateTime.fromISO(value?.last_connected_at || '').toLocaleString(
                    DateTime.DATETIME_MED_WITH_SECONDS,
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Dernière IP connue" secondary={value?.last_ip} />
              </ListItem>
            </List>
          </Stack>

          {!isCurrentUser && (
            <Stack mt="16px" direction="row" justifyContent="center" gap={1} flexWrap="wrap">
              <ConfirmButton
                confirmTitle={enabled ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                confirmText={
                  enabled
                    ? 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?'
                    : 'Êtes-vous sûr de vouloir activer cet utilisateur ?'
                }
                onClick={() => (enabled ? disableUser() : enableUser())}
                disabled={loading}
                size="small"
                variant="outlined"
                color={enabled ? 'error' : 'success'}
              >
                {enabled ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
              </ConfirmButton>

              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                onClick={() => setUpdatePasswordModalOpen(true)}
              >
                Changer le mot de passe
              </Button>
            </Stack>
          )}
        </Card>
        <br />
        <Card>
          <Subtitle>Modifier les informations</Subtitle>

          <Stack component="form" gap={3} onSubmit={updateProfile}>
            <Stack direction="row" flexWrap="wrap" gap={3}>
              <Box sx={{ flexGrow: 1 }}>
                <InputLabel required>Prénom</InputLabel>
                <TextField
                  autoComplete="off"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={firstname}
                  inputProps={{ maxLength: 50 }}
                  placeholder="John"
                  required
                  helperText={<CharsRemaining max={50} value={firstname} />}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <InputLabel required>Nom</InputLabel>
                <TextField
                  autoComplete="off"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={lastname}
                  inputProps={{ maxLength: 50 }}
                  placeholder="Doe"
                  required
                  helperText={<CharsRemaining max={50} value={lastname} />}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </Box>
            </Stack>

            <Box>
              <InputLabel required>Email</InputLabel>
              <TextField
                type="email"
                autoComplete="off"
                disabled={loading || isCurrentUser}
                fullWidth
                value={email}
                placeholder="john@doe.fr"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            <Stack>
              <InputLabel>Date de naissance</InputLabel>
              <MobileDatePicker
                value={birthday}
                disabled={loading || isCurrentUser}
                defaultCalendarMonth={DateTime.now().minus({ year: 30 })}
                onChange={(date) => setBirthday(date)}
                disableFuture={true}
              />
            </Stack>

            {!isCurrentUser && (
              <Stack direction="row" justifyContent="center">
                <LoadingButton
                  sx={{ marginTop: '20px' }}
                  type="submit"
                  variant="contained"
                  size="large"
                  color="secondary"
                  loading={loading}
                  loadingPosition="start"
                  disabled={loading || isCurrentUser}
                  startIcon={<SaveIcon />}
                >
                  Mettre à jour
                </LoadingButton>
              </Stack>
            )}
          </Stack>
        </Card>
      </Box>
    </Loader>
  );
};
