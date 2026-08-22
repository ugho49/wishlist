import type { UserId } from '@wishlist/common';
import type { FormEvent } from 'react';
import type { RootState } from '../../../core/store';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import LanguageIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Button, List, ListItem, ListItemIcon, ListItemText, Stack, TextField } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { AdminListEvents } from '@wishlist/front-components/event/admin/AdminListEvents';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import { uploadAdminUserPicture } from '../../../api/upload';
import {
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useAdminRemoveUserPictureMutation,
  useAdminUpdateUserProfileMutation,
  useAdminUserDetailQuery,
} from '../../../gql';
import { useToast } from '../../../hooks';
import { Card } from '../../common/Card';
import { CharsRemaining } from '../../common/CharsRemaining';
import { ConfirmButton } from '../../common/ConfirmButton';
import { WishlistDatePicker } from '../../common/DatePicker';
import { Loader } from '../../common/Loader';
import { Subtitle } from '../../common/Subtitle';
import { Title } from '../../common/Title';
import { AdminListWishlistsForUser } from '../../wishlist/admin/AdminListWishlistsForUser';
import { AvatarUpdateButton } from '../AvatarUpdateButton';
import { UpdatePasswordModal } from './UpdatePasswordModal';

const mapState = (state: RootState) => state.auth;

const UserNameAndEmail = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  marginBottom: theme.spacing(5),
}));

const Name = styled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: '1.3rem',
  color: theme.palette.text.primary,
}));

const Email = styled('div')(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

const CardStack = styled(Stack)(() => ({
  gap: 32,
}));

interface AdminUserPageProps {
  userId: UserId;
}

export const AdminUserPage = ({ userId }: AdminUserPageProps) => {
  const { addToast } = useToast();
  const { user: currentUser } = useSelector(mapState);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const [updatePasswordModalOpen, setUpdatePasswordModalOpen] = useState(false);
  const { eventPage } = useSearch({ from: '/_authenticated/_with-layout/admin/users/$userId' });
  const navigate = useNavigate();

  const changeEventPage = (page: number) => {
    void navigate({ to: '/admin/users/$userId', params: { userId }, search: prev => ({ ...prev, eventPage: page }) });
  };

  const { data, isLoading: loadingUser } = useAdminUserDetailQuery({ userId }, { select: d => d.adminUser });
  const value = data?.__typename === 'UserFull' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const { mutateAsync: updateUser } = useAdminUpdateUserProfileMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSettled: () => setLoading(false),
  });
  const { mutateAsync: removeUserPicture } = useAdminRemoveUserPictureMutation();

  const invalidateUser = () => queryClient.invalidateQueries({ queryKey: ['AdminUserDetail', { userId }] });

  const isCurrentUser = currentUser?.id === userId;

  useEffect(() => {
    if (value) {
      setEmail(value.email);
      setFirstname(value.firstName);
      setLastname(value.lastName);
      setBirthday(value?.birthday ? DateTime.fromISO(value.birthday) : null);
      setEnabled(value.isEnabled);
      setPictureUrl(value.pictureUrl || '');
    }
  }, [value]);

  const setUserEnabled = async (isEnabled: boolean) => {
    setLoading(true);
    setEnabled(isEnabled);
    const res = await updateUser({ userId, input: { isEnabled } });
    match(res.adminUpdateUserProfile)
      .with({ __typename: 'VoidOutput' }, () => {
        void invalidateUser();
        addToast({ message: isEnabled ? 'Utilisateur activé' : 'Utilisateur désactivé', variant: 'success' });
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const disableUser = () => setUserEnabled(false);
  const enableUser = () => setUserEnabled(true);

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateUser({
      userId,
      input: {
        firstname,
        lastname,
        birthday: birthday === null ? undefined : birthday.toISODate() || undefined,
        email,
      },
    });
    match(res.adminUpdateUserProfile)
      .with({ __typename: 'VoidOutput' }, () => {
        void invalidateUser();
        addToast({ message: 'Profil mis à jour', variant: 'success' });
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Loader loading={loadingUser}>
      <Title>Editer l'utilisateur</Title>

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      <UpdatePasswordModal
        userId={userId}
        open={updatePasswordModalOpen}
        onClose={() => setUpdatePasswordModalOpen(false)}
      />

      <Stack direction="row" justifyContent="center" flexWrap="wrap" mb={2}>
        <AvatarUpdateButton
          size="120px"
          pictureUrl={pictureUrl}
          socials={[]}
          onPictureUpdated={url => {
            setPictureUrl(url || '');
            void invalidateUser();
          }}
          uploadPictureHandler={file => uploadAdminUserPicture(userId, file)}
          updatePictureFromSocialHandler={() => Promise.resolve()}
          deletePictureHandler={async () => {
            const res = await removeUserPicture({ userId });
            // AvatarUpdateButton owns the error UI for this handler: throwing keeps
            // its catch path (error toast) and prevents it from clearing the picture.
            match(res.adminRemoveUserPicture)
              .with({ __typename: 'VoidOutput' }, () => undefined)
              .with(rejectionPattern, rejection => {
                throw new Error(rejectionMessage(rejection));
              })
              .exhaustive();
          }}
        />
      </Stack>

      <UserNameAndEmail>
        <Name>
          {firstname} {lastname}
        </Name>
        <Email>{email}</Email>
      </UserNameAndEmail>

      <CardStack>
        <Card>
          <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Inscrit le"
                  secondary={DateTime.fromISO(value?.createdAt || '').toLocaleString(
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
                  secondary={
                    value?.lastConnectedAt
                      ? DateTime.fromISO(value.lastConnectedAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)
                      : ' - '
                  }
                />
              </ListItem>
            </List>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Dernière IP connue" secondary={value?.lastIp || ' - '} />
              </ListItem>
            </List>
          </Stack>

          {!isCurrentUser && (
            <Stack mt="16px" direction="row" justifyContent="center" gap={1} flexWrap="wrap">
              <ConfirmButton
                sx={{ padding: '3px 10px' }}
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
                sx={{ padding: '3px 10px' }}
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

        <Card>
          <Subtitle>Modifier les informations</Subtitle>

          <Stack component="form" gap={3} onSubmit={updateProfile}>
            <Stack direction="row" flexWrap="wrap" gap={3}>
              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <TextField
                  autoComplete="off"
                  label="Prénom"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={firstname}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                  placeholder="John"
                  required
                  helperText={<CharsRemaining max={50} value={firstname} />}
                  onChange={e => setFirstname(e.target.value)}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <TextField
                  autoComplete="off"
                  label="Nom"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={lastname}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                  placeholder="Doe"
                  required
                  helperText={<CharsRemaining max={50} value={lastname} />}
                  onChange={e => setLastname(e.target.value)}
                />
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={3}>
              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="off"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={email}
                  placeholder="john@doe.fr"
                  required
                  onChange={e => setEmail(e.target.value)}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <WishlistDatePicker
                  label="Date de naissance"
                  value={birthday}
                  disabled={loading || isCurrentUser}
                  onChange={date => setBirthday(date)}
                  disableFuture
                  fullWidth
                />
              </Box>
            </Stack>

            {!isCurrentUser && (
              <Stack direction="row" justifyContent="center">
                <Button
                  sx={{ marginTop: '8px' }}
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={loading}
                  loadingPosition="start"
                  disabled={loading || isCurrentUser}
                  startIcon={<SaveIcon />}
                >
                  Mettre à jour
                </Button>
              </Stack>
            )}
          </Stack>
        </Card>

        <Card>
          <Subtitle>Evènements</Subtitle>
          <AdminListEvents userId={userId} currentPage={eventPage} changeCurrentPage={changeEventPage} />
        </Card>

        <Card>
          <Subtitle>Wishlists</Subtitle>
          <AdminListWishlistsForUser userId={userId} />
        </Card>
      </CardStack>
    </Loader>
  );
};
