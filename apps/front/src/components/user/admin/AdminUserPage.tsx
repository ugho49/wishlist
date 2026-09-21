import type { UserId, UserSessionId } from '@wishlist/common';
import type { FormEvent } from 'react';
import type { RootState } from '../../../core/store';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DevicesIcon from '@mui/icons-material/Devices';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import PortraitIcon from '@mui/icons-material/Portrait';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Switch,
  Tab,
  TextField,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
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
  useAdminSetUserAdminMutation,
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
import { formatSignupSource } from '../../onboarding/signup-source';
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
  width: 88,
  height: 88,
  fontSize: '2rem',
  backgroundColor: theme.palette.primary.main,
  flexShrink: 0,
}));

const ReadOnlyAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const AccessRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 2.5),
  backgroundColor: theme.palette.grey[50],
}));

const AccessIcon = styled('span', { shouldForwardProp: prop => prop !== 'active' })<{ active: boolean }>(
  ({ theme, active }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    flexShrink: 0,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[100],
  }),
);

const AccessCopy = styled('div')({
  flex: 1,
  minWidth: 0,
});

const AccessTitle = styled('p')(({ theme }) => ({
  margin: 0,
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.3,
  color: theme.palette.text.primary,
}));

const AccessHint = styled('p')(({ theme }) => ({
  margin: 0,
  marginTop: theme.spacing(0.25),
  fontSize: '0.75rem',
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
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
  const { eventPage, eventSearch, tab } = useSearch({ from: '/_authenticated/_with-layout/admin/users/$userId' });
  const navigate = useNavigate({ from: '/admin/users/$userId' });

  const changeEventPage = (page: number) => {
    void navigate({ search: prev => ({ ...prev, eventPage: page }) });
  };

  const changeEventSearch = (search: string) => {
    void navigate({ search: prev => ({ ...prev, eventPage: 1, eventSearch: search }) });
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
  const { mutateAsync: setUserAdminStatus, isPending: settingAdmin } = useAdminSetUserAdminMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSettled: () => setLoading(false),
  });

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
  const isSuperAdmin = value?.authorities.includes(UserAuthorities.RoleSuperadmin) ?? false;
  const isAdmin = value?.authorities.includes(UserAuthorities.RoleAdmin) ?? false;
  const canManageTarget = !isSuperAdmin && (Boolean(currentUser?.isSuperAdmin) || !isAdmin);
  const canEditUser = !isCurrentUser && canManageTarget;
  const canToggleAdmin = Boolean(currentUser?.isSuperAdmin) && !isCurrentUser && !isSuperAdmin;
  const readOnlyMessage = match({ canEditUser, isCurrentUser, isSuperAdmin })
    .with({ canEditUser: true }, () => undefined)
    .with({ isCurrentUser: true }, () => undefined)
    .with({ isSuperAdmin: true }, () => 'Un super-admin ne peut pas être modifié.')
    .otherwise(() => 'Vous ne pouvez pas modifier un autre admin.');
  const displayName = [firstname, lastname].filter(Boolean).join(' ') || 'Utilisateur';
  const roleChip = match({ isSuperAdmin, isAdmin })
    .with({ isSuperAdmin: true }, () => <Chip size="small" color="warning" label="Super-admin" />)
    .with({ isAdmin: true }, () => <Chip size="small" color="primary" label="Admin" />)
    .otherwise(() => null);

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

  const setUserAdmin = async (nextIsAdmin: boolean) => {
    setLoading(true);
    const res = await setUserAdminStatus({ userId, isAdmin: nextIsAdmin });
    match(res.adminSetUserAdmin)
      .with({ __typename: 'VoidOutput' }, () => {
        void invalidateUser();
        void queryClient.invalidateQueries({ queryKey: ['AdminUsersStats'] });
        addToast({
          message: nextIsAdmin ? 'Utilisateur nommé admin' : 'Accès admin retiré',
          variant: 'success',
        });
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

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
          canEditUser ? (
            <AvatarUpdateButton
              compact
              size="88px"
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
          ) : (
            <HeaderUserAvatar src={pictureUrl || undefined}>
              {(firstname || displayName).substring(0, 1).toUpperCase()}
            </HeaderUserAvatar>
          )
        }
        chips={
          <>
            <Chip size="small" color={enabled ? 'success' : 'default'} label={enabled ? 'Actif' : 'Désactivé'} />
            {roleChip}
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
                disabled={loading || !canEditUser}
                size="small"
                variant="outlined"
                color={enabled ? 'error' : 'success'}
              >
                {enabled ? 'Désactiver' : 'Activer'}
              </ConfirmButton>
              <Button
                variant="outlined"
                size="small"
                disabled={loading || !canEditUser}
                onClick={() => setUpdatePasswordModalOpen(true)}
              >
                Changer le mot de passe
              </Button>
            </>
          )
        }
      />

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}
      {readOnlyMessage ? <ReadOnlyAlert severity="info">{readOnlyMessage}</ReadOnlyAlert> : null}

      <AdminTabs
        value={tab}
        onChange={(_, newValue) =>
          void navigate({
            search: prev => ({ ...prev, tab: newValue as AdminUserTab }),
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
        <AdminSection
          footer={
            canToggleAdmin ? (
              <AdminAccessToggle
                isAdmin={isAdmin}
                disabled={loading || settingAdmin}
                onConfirm={nextIsAdmin => void setUserAdmin(nextIsAdmin)}
              />
            ) : undefined
          }
        >
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
                  disabled={loading || !canEditUser}
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
                  disabled={loading || !canEditUser}
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
                  disabled={loading || !canEditUser}
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
                  disabled={loading || !canEditUser}
                  onChange={date => setBirthday(date)}
                  disableFuture
                  fullWidth
                />
              </Box>
            </Stack>

            <TextField
              label="Comment le site a été connu"
              value={formatSignupSource(value?.signupSource, value?.signupSourceDetail)}
              fullWidth
              disabled
            />

            {canEditUser && (
              <FormActions>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={loading}
                  loadingPosition="start"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                >
                  Mettre à jour
                </Button>
              </FormActions>
            )}
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
          {(value?.sessions.length ?? 0) > 0 && canEditUser && (
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
            disabled={!canEditUser || loading || revokingSession || revokingAllSessions}
            onRevoke={sessionId => void revokeUserSession(sessionId)}
          />
        </AdminSection>
      )}

      {tab === AdminUserTab.events && (
        <AdminSection>
          <AdminListEvents
            userId={userId}
            currentPage={eventPage}
            search={eventSearch}
            changeCurrentPage={changeEventPage}
            changeSearch={changeEventSearch}
          />
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

type AdminAccessToggleProps = {
  isAdmin: boolean;
  disabled: boolean;
  onConfirm: (nextIsAdmin: boolean) => void;
};

const AdminAccessToggle = ({ isAdmin, disabled, onConfirm }: AdminAccessToggleProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const nextIsAdmin = !isAdmin;

  return (
    <>
      <AccessRow>
        <AccessIcon active={isAdmin}>
          <AdminPanelSettingsIcon fontSize="small" />
        </AccessIcon>
        <AccessCopy>
          <AccessTitle>Accès administration</AccessTitle>
          <AccessHint>
            {isAdmin
              ? 'Peut gérer les utilisateurs, les évènements et les listes.'
              : "Donne accès à l'espace d'administration."}
          </AccessHint>
        </AccessCopy>
        <Switch
          checked={isAdmin}
          disabled={disabled}
          color="primary"
          edge="end"
          slotProps={{ input: { 'aria-label': 'Accès administration' } }}
          onChange={() => setConfirmOpen(true)}
        />
      </AccessRow>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} disableScrollLock>
        <DialogTitle>{nextIsAdmin ? 'Nommer admin' : "Retirer l'accès admin"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {nextIsAdmin
              ? "Cet utilisateur pourra accéder à l'espace d'administration."
              : "Cet utilisateur n'aura plus accès à l'espace d'administration. Ses sessions seront révoquées."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button
            color={nextIsAdmin ? 'primary' : 'error'}
            onClick={() => {
              setConfirmOpen(false);
              onConfirm(nextIsAdmin);
            }}
            autoFocus
          >
            {nextIsAdmin ? 'Nommer admin' : 'Retirer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
