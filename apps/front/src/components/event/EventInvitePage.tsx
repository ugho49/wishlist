import type { EventId } from '@wishlist/common';
import type { RootState } from '../../core/store';

import LoginIcon from '@mui/icons-material/Login';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Alert, Box, Button, Container, Paper, Stack, styled, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import {
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useEventInvitePreviewQuery,
  useJoinEventByInviteMutation,
} from '../../gql';
import { useToast } from '../../hooks';
import { RouterLink } from '../common/RouterLink';
import { SEO } from '../SEO';
import { EventIcon } from './EventIcon';

const Page = styled(Box)(({ theme }) => ({
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3, 0),
}));

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  width: '100%',
}));

const mapAuthState = (state: RootState) => state.auth.accessToken !== undefined;

export type EventInvitePageProps = {
  token: string;
};

export const EventInvitePage = ({ token }: EventInvitePageProps) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isLoggedIn = useSelector(mapAuthState);
  const redirectUrl = `/invite/${token}`;
  const { data, isLoading } = useEventInvitePreviewQuery({ token });
  const preview = data?.eventInvitePreview.__typename === 'EventInvitePreview' ? data.eventInvitePreview : undefined;
  const rejection =
    data?.eventInvitePreview && isRejection(data.eventInvitePreview) ? data.eventInvitePreview : undefined;

  const { mutateAsync: joinEvent, isPending: joining } = useJoinEventByInviteMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  const goToEvent = (eventId: EventId) => {
    void navigate({ to: '/events/$eventId', params: { eventId } });
  };

  const onJoin = async () => {
    const res = await joinEvent({ token });
    match(res.joinEventByInvite)
      .with({ __typename: 'Event' }, event => {
        addToast({ message: `Vous avez rejoint « ${event.title} »`, variant: 'success' });
        goToEvent(event.id);
      })
      .with(rejectionPattern, joinRejection => addToast({ message: rejectionMessage(joinRejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Page>
      <SEO
        title={preview?.title ? `Invitation — ${preview.title}` : 'Invitation à un événement'}
        description="Rejoignez un événement Wishlist et consultez les listes de souhaits de vos proches."
        canonical={redirectUrl}
      />
      <Container maxWidth="sm">
        <Card elevation={3}>
          {isLoading && <Typography color="text.secondary">Chargement de l'invitation…</Typography>}

          {!isLoading && rejection && (
            <Alert severity={rejection.__typename === 'NotFoundRejection' ? 'warning' : 'error'}>
              {rejection.__typename === 'NotFoundRejection'
                ? "Cette invitation n'existe pas ou n'est plus valide."
                : rejectionMessage(rejection)}
            </Alert>
          )}

          {!isLoading && preview && (
            <Stack sx={{ gap: 3, alignItems: 'center', textAlign: 'center' }}>
              <EventIcon icon={preview.icon ?? undefined} size="large" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {preview.title}
                </Typography>
                <Typography color="text.secondary">
                  Organisé par {preview.hostDisplayName} ·{' '}
                  {DateTime.fromISO(preview.eventDate).toLocaleString(DateTime.DATE_FULL)}
                </Typography>
              </Box>

              {preview.description && (
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {preview.description}
                </Typography>
              )}

              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <PeopleIcon fontSize="small" />
                <Typography variant="body2">
                  {preview.attendeeCount} {preview.attendeeCount > 1 ? 'participants' : 'participant'}
                </Typography>
              </Stack>

              {isLoggedIn && (
                <Button variant="contained" size="large" loading={joining} onClick={() => void onJoin()}>
                  {preview.alreadyJoined ? "Voir l'événement" : "Rejoindre l'événement"}
                </Button>
              )}

              {!isLoggedIn && (
                <Stack sx={{ gap: 1.5, width: '100%' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => void navigate({ to: '/login', search: { redirectUrl } })}
                  >
                    Se connecter pour rejoindre
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    onClick={() => void navigate({ to: '/register', search: { redirectUrl } })}
                  >
                    Créer un compte
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Déjà sur Wishlist ?{' '}
                    <RouterLink to="/login" search={{ redirectUrl }}>
                      Connexion
                    </RouterLink>
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </Card>
      </Container>
    </Page>
  );
};
