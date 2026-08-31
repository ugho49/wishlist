import DevicesIcon from '@mui/icons-material/Devices';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import { Chip, Stack, styled, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  rejectionMessage,
  rejectionPattern,
  type UserProfileCurrentUserQuery,
  useRevokeUserSessionMutation,
  useUserProfileCurrentUserQuery,
} from '../../gql';
import { useLogout } from '../../hooks/useLogout';
import { useToast } from '../../hooks/useToast';
import { type DeviceType, parseUserAgent } from '../../utils/user-agent.utils';
import { Card } from '../common/Card';
import { ConfirmButton } from '../common/ConfirmButton';
import { Loader } from '../common/Loader';
import { Subtitle } from '../common/Subtitle';

type UserSessionItem = NonNullable<
  Extract<UserProfileCurrentUserQuery['currentUser'], { __typename: 'User' }>['sessions']
>[number];

const SessionsList = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
}));

const SessionRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SessionIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  minWidth: 40,
}));

const SessionDetails = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
  minWidth: 0,
}));

const SessionMeta = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
}));

const SessionActions = styled('div')(({ theme }) => ({
  display: 'flex',
  marginLeft: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
  },
}));

const deviceIcon = (deviceType: DeviceType) =>
  match(deviceType)
    .with('mobile', () => <PhoneIphoneIcon />)
    .with('tablet', () => <TabletMacIcon />)
    .with('desktop', () => <LaptopMacIcon />)
    .with('unknown', () => <DevicesIcon />)
    .exhaustive();

const formatDate = (value: string) => DateTime.fromISO(value).toLocaleString(DateTime.DATETIME_MED);

export const UserTabSessions = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const logout = useLogout();
  const { data, isLoading } = useUserProfileCurrentUserQuery();
  const { mutateAsync: revokeSession, isPending: revokingOne } = useRevokeUserSessionMutation();

  const sessions: UserSessionItem[] = data?.currentUser.__typename === 'User' ? (data.currentUser.sessions ?? []) : [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] });

  const disconnectSession = async (session: UserSessionItem) => {
    if (session.current) {
      await logout();
      return;
    }

    const res = await revokeSession({ input: { sessionId: session.id } });
    match(res.revokeSession)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Appareil déconnecté', variant: 'info' });
        void invalidate();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Card>
      <Subtitle>Appareils connectés ({sessions.length})</Subtitle>

      <Loader loading={isLoading}>
        {sessions.length === 0 ? (
          <Typography color="text.secondary">Aucune session active.</Typography>
        ) : (
          <SessionsList>
            {sessions.map(session => {
              const parsed = parseUserAgent(session.userAgent);
              return (
                <SessionRow key={session.id}>
                  <SessionIcon>{deviceIcon(parsed.deviceType)}</SessionIcon>
                  <SessionDetails>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 500 }}>{parsed.label}</Typography>
                      {session.current && <Chip size="small" color="primary" label="Cet appareil" />}
                    </Stack>
                    <SessionMeta>
                      {parsed.deviceLabel}
                      {session.ip ? ` · ${session.ip}` : ''}
                    </SessionMeta>
                    <SessionMeta>
                      Connecté le {formatDate(session.createdAt)} · Dernière activité {formatDate(session.lastUsedAt)}
                    </SessionMeta>
                  </SessionDetails>
                  <SessionActions>
                    <ConfirmButton
                      confirmTitle={session.current ? 'Se déconnecter' : 'Déconnecter cet appareil'}
                      confirmText={
                        session.current
                          ? 'Vous allez être déconnecté de cet appareil.'
                          : 'Cet appareil devra se reconnecter.'
                      }
                      onClick={() => void disconnectSession(session)}
                      loading={revokingOne}
                      disabled={revokingOne}
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<LogoutIcon fontSize="small" />}
                    >
                      Déconnecter
                    </ConfirmButton>
                  </SessionActions>
                </SessionRow>
              );
            })}
          </SessionsList>
        )}
      </Loader>
    </Card>
  );
};
