import type { EventId } from '@wishlist/common';
import type { RootState } from '../../core/store';
import type { EventDetail } from './event.types';

import { Alert, Box, Container, Stack, styled } from '@mui/material';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { isRejection, rejectionMessage, SecretSantaStatus, useEventPageGetEventQuery } from '../../gql';
import { useSecretSantaSuggestion } from '../../hooks';
import { SectionHeader, SectionTitle } from '../common/PageHero';
import { SEO } from '../SEO';
import { EventAttendeesDialog } from './EventAttendeesDialog';
import { EventHeader } from './EventHeader';
import { EventHeaderSkeleton } from './EventHeaderSkeleton';
import { EventNotFound } from './EventNotFound';
import { EventWishlists } from './EventWishlists';
import { canEditEvent } from './event-permissions';
import { MySecretSantaDraw } from './MySecretSantaDraw';
import { SecretSantaLaunchSuggestion } from './SecretSantaLaunchSuggestion';
import { SecretSantaSuggestionCard } from './SecretSantaSuggestionCard';

const mapState = (state: RootState) => state.auth.user?.id;

const PageBody = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  paddingTop: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(4),
    paddingTop: theme.spacing(3),
  },
}));

interface EventPageProps {
  eventId: EventId;
}

export const EventPage = ({ eventId }: EventPageProps) => {
  const currentUserId = useSelector(mapState);
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false);
  const { data, isLoading: loading } = useEventPageGetEventQuery({ eventId }, { select: d => d.event });
  const event = data?.__typename === 'Event' ? data : undefined;
  const queryRejection = data && isRejection(data) && data.__typename !== 'NotFoundRejection' ? data : undefined;

  const attendees = useMemo(() => event?.attendees ?? [], [event]);
  const currentUserCanEdit = useMemo(() => canEditEvent(attendees, currentUserId), [attendees, currentUserId]);
  const currentAttendeeId = useMemo(
    () => attendees.find(attendee => attendee.user?.id === currentUserId)?.id,
    [attendees, currentUserId],
  );
  const { shouldShowSuggestion, dismissSuggestion } = useSecretSantaSuggestion({
    eventId: eventId,
    eventTitle: event?.title,
    eventDate: event?.eventDate,
    currentUserCanEdit,
  });

  const renderSecretSantaRow = (loadedEvent: EventDetail) => {
    if (shouldShowSuggestion) {
      return <SecretSantaSuggestionCard eventId={loadedEvent.id} onDismiss={dismissSuggestion} />;
    }

    const eventIsPast = DateTime.fromISO(loadedEvent.eventDate).startOf('day') < DateTime.now().startOf('day');
    if (currentUserCanEdit && loadedEvent.secretSanta?.status === SecretSantaStatus.Created && !eventIsPast) {
      return (
        <SecretSantaLaunchSuggestion
          eventId={loadedEvent.id}
          participantsCount={loadedEvent.secretSanta.users.length}
        />
      );
    }

    return (
      <MySecretSantaDraw
        eventId={loadedEvent.id}
        eventTitle={loadedEvent.title}
        eventDate={loadedEvent.eventDate}
        secretSanta={loadedEvent.secretSanta}
        currentAttendeeId={currentAttendeeId}
      />
    );
  };

  return (
    <>
      <SEO
        title={event?.title || 'Événement'}
        description={`Consultez les listes de souhaits pour l'événement ${event?.title || ''}.`}
        canonical={`/events/${eventId}`}
      />
      <Box>
        {loading && (
          <>
            <EventHeaderSkeleton />
            <Container maxWidth="lg">
              <PageBody>
                <EventWishlists loading />
              </PageBody>
            </Container>
          </>
        )}

        {!loading && queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}
        {!loading && !event && !queryRejection && <EventNotFound />}
        {!loading && event && (
          <>
            <EventHeader
              icon={event.icon ?? undefined}
              title={event.title}
              description={event.description ?? undefined}
              eventId={event.id}
              eventDate={event.eventDate}
              attendees={attendees}
              currentUserCanEdit={currentUserCanEdit}
              openAttendeesDialog={() => setOpenAttendeesDialog(true)}
              secretSanta={renderSecretSantaRow(event)}
            />

            <Container maxWidth="lg">
              <PageBody>
                <section>
                  <SectionHeader>
                    <SectionTitle>
                      Listes
                      <span className="count">{event.wishlists.length}</span>
                    </SectionTitle>
                  </SectionHeader>
                  <EventWishlists eventId={event.id} wishlists={event.wishlists} />
                </section>
              </PageBody>
            </Container>

            <EventAttendeesDialog
              open={openAttendeesDialog}
              handleClose={() => setOpenAttendeesDialog(false)}
              currentUserCanEdit={currentUserCanEdit}
              eventId={event.id}
              attendees={attendees}
            />
          </>
        )}
      </Box>
    </>
  );
};
