import type { UserId, UserSessionId } from '@wishlist/common';
import type { FormEvent } from 'react';
import type { RootState } from '../../../core/store';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DevicesIcon from '@mui/icons-material/Devices';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import PortraitIcon from '@mui/icons-material/Portrait';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Avatar, Box, Button, Chip, Stack, Tab, TextField } from '@mui/material';
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
  UserAuthorities,
  useAdminRemoveUserPictureMutation,
  useAdminRevokeAllUserSessionsMutation,
  useAdminRevokeUserSessionMutation,
  useAdminUpdateUserProfileMutation,
  useAdminUserDetailQuery,
} from '../../../gql';
import { useToast } from '../../../hooks';
import { AdminPageHeader } from '../../admin/AdminPageHeader';
import { AdminSection } from '../../admin/AdminSection';
import { AdminTabs } from '../../admin/AdminTabs';
import { CharsRemaining } from '../../common/CharsRemaining';
import { ConfirmButton } from '../../common/ConfirmButton';
import { WishlistDatePicker } from '../../common/DatePicker';
import { Loader } from '../../common/Loader';
import { AdminListWishlistsForUser } from '../../wishlist/admin/AdminListWishlistsForUser';
import { AvatarUpdateButton } from '../AvatarUpdateButton';
import { AdminListUserAccounts } from './AdminListUserAccounts';
import { AdminListUserSessions } from './AdminListUserSessions';
import { UpdatePasswordModal } from './UpdatePasswordModal';

const mapState = (state: RootState) => state.auth;

export enum AdminUserTab {
  profile = 'profile',
  accounts = 'accounts',
  sessions = 'sessions',
  events = 'events',
  wishlists = 'wishlists',
}

const userTabs = [
  { value: AdminUserTab.profile, label: 'Profil', icon: <PortraitIcon /> },
  { value: AdminUserTab.accounts, label: 'Comptes', icon: <LinkIcon /> },
  { value: AdminUserTab.sessions, label: 'Sessions', icon: <DevicesIcon /> },
  { value: AdminUserTab.events, label: 'Évènements', icon: <CalendarMonthIcon /> },
  { value: AdminUserTab.wishlists, label: 'Listes', icon: <FormatListBulletedIcon /> },
];

const FormActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginTop: theme.spacing(1),
}));

const SessionsHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const HeaderUserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  fontSize: '1rem',
  backgroundColor: theme.palette.primary.main,
}));

interface AdminUserPageProps {
  userId: UserId;
}

export const AdminUserPage = ({ userId }: AdminUserPageProps) => {
  const { addToast } = useToast();
  const { user: currentUser } = useSelector(mapState);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const [updatePasswordModalOpen, setUpdatePasswordModalOpen] = useState(false);
  const { eventPage, tab } = useSearch({ from: '/_authenticated/_with-layout/admin/users/$userId' });
  const navigate = useNavigate({ from: '/admin/users/$userId' });

  const changeEventPage = (page: number) => {
    void navigate({ search: prev => ({ eventPage: page, tab: prev.tab }) });
  };

  const { data, isLoading: loadingUser } = useAdminUserDetailQuery({ userId }, { select: d => d.adminUser });
  const value = data?.__typename === 'UserFull' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const { mutateAsync: updateUser } = useAdminUpdateUserProfileMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSettled: () => setLoading(false),
  });
  const { mutateAsync: removeUserPicture } = useAdminRemoveUserPictureMutation();
  const { mutateAsync: revokeSession, isPending: revokingSession } = useAdminRevokeUserSessionMutation();
  const { mutateAsync: revokeAllSessions, isPending: revokingAllSessions } = useAdminRevokeAllUserSessionsMutation();

  const invalidateUser = () => queryClient.invalidateQueries({ queryKey: ['AdminUserDetail', { userId }] });

  const revokeUserSession = async (sessionId: UserSessionId) => {
    const res = await revokeSession({ userId, sessionId });
    match(res.adminRevokeUserSession)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Session révoquée', variant: 'info' });
        void invalidateUser();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const revokeAllUserSessions = async () => {
    const res = await revokeAllSessions({ userId });
    match(res.adminRevokeAllUserSessions)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Toutes les sessions ont été révoquées', variant: 'info' });
        void invalidateUser();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const isCurrentUser = currentUser?.id === userId;
  const isAdmin =
    value?.authorities.some(a => a === UserAuthorities.RoleAdmin || a === UserAuthorities.RoleSuperadmin) ?? false;
  const displayName = [firstname, lastname].filter(Boolean).join(' ') || 'Utilisateur';

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
      <UpdatePasswordModal
        userId={userId}
        open={updatePasswordModalOpen}
        onClose={() => setUpdatePasswordModalOpen(false)}
      />

      <AdminPageHeader
        title={displayName}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Utilisateurs', to: '/admin/users' },
          { label: displayName },
        ]}
        avatar={
          <HeaderUserAvatar src={pictureUrl || undefined}>
            {(firstname || displayName).substring(0, 1).toUpperCase()}
          </HeaderUserAvatar>
        }
        chips={
          <>
            <Chip size="small" color={enabled ? 'success' : 'default'} label={enabled ? 'Actif' : 'Désactivé'} />
            {isAdmin ? <Chip size="small" color="primary" label="Admin" /> : null}
          </>
        }
        meta={
          <>
            {email}
            {value?.createdAt
              ? ` · Inscrit le ${DateTime.fromISO(value.createdAt).toLocaleString(DateTime.DATETIME_MED)}`
              : ''}
          </>
        }
        actions={
          isCurrentUser ? undefined : (
            <>
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
                {enabled ? 'Désactiver' : 'Activer'}
              </ConfirmButton>
              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                onClick={() => setUpdatePasswordModalOpen(true)}
              >
                Changer le mot de passe
              </Button>
            </>
          )
        }
      />

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      <AdminTabs
        value={tab}
        onChange={(_, newValue) =>
          void navigate({
            search: prev => ({ eventPage: prev.eventPage, tab: newValue as AdminUserTab }),
          })
        }
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {userTabs.map(tabItem => (
          <Tab
            key={tabItem.value}
            value={tabItem.value}
            label={smallScreen ? undefined : tabItem.label}
            iconPosition="start"
            icon={tabItem.icon}
          />
        ))}
      </AdminTabs>

      {tab === AdminUserTab.profile && (
        <AdminSection>
          <Stack
            sx={{
              gap: 3,
            }}
          >
            {!isCurrentUser && (
              <AvatarUpdateButton
                size="56px"
                pictureUrl={pictureUrl}
                accounts={[]}
                onPictureUpdated={url => {
                  setPictureUrl(url || '');
                  void invalidateUser();
                }}
                uploadPictureHandler={file => uploadAdminUserPicture(userId, file)}
                updatePictureFromAccountHandler={() => Promise.resolve()}
                deletePictureHandler={async () => {
                  const res = await removeUserPicture({ userId });
                  match(res.adminRemoveUserPicture)
                    .with({ __typename: 'VoidOutput' }, () => undefined)
                    .with(rejectionPattern, rejection => {
                      throw new Error(rejectionMessage(rejection));
                    })
                    .exhaustive();
                }}
              />
            )}
            <Stack
              component="form"
              onSubmit={updateProfile}
              sx={{
                gap: 3,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  flexWrap: 'wrap',
                  gap: 3,
                }}
              >
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

              <Stack
                direction="row"
                sx={{
                  flexWrap: 'wrap',
                  gap: 3,
                }}
              >
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
                <FormActions>
                  <Button
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
                </FormActions>
              )}
            </Stack>
          </Stack>
        </AdminSection>
      )}

      {tab === AdminUserTab.accounts && (
        <AdminSection>
          <AdminListUserAccounts accounts={value?.accounts ?? []} />
        </AdminSection>
      )}

      {tab === AdminUserTab.sessions && (
        <AdminSection>
          {(value?.sessions.length ?? 0) > 0 && !isCurrentUser && (
            <SessionsHeader>
              <ConfirmButton
                confirmTitle="Révoquer toutes les sessions"
                confirmText="L'utilisateur devra se reconnecter sur tous ses appareils."
                onClick={() => void revokeAllUserSessions()}
                loading={revokingAllSessions}
                disabled={loading || revokingSession || revokingAllSessions}
                size="small"
                variant="outlined"
                color="error"
              >
                Révoquer toutes
              </ConfirmButton>
            </SessionsHeader>
          )}
          <AdminListUserSessions
            sessions={value?.sessions ?? []}
            disabled={isCurrentUser || loading || revokingSession || revokingAllSessions}
            onRevoke={sessionId => void revokeUserSession(sessionId)}
          />
        </AdminSection>
      )}

      {tab === AdminUserTab.events && (
        <AdminSection>
          <AdminListEvents userId={userId} currentPage={eventPage} changeCurrentPage={changeEventPage} />
        </AdminSection>
      )}

      {tab === AdminUserTab.wishlists && (
        <AdminSection>
          <AdminListWishlistsForUser userId={userId} />
        </AdminSection>
      )}
    </Loader>
  );
};
