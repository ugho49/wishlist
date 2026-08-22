import type { EventId } from '@wishlist/common';
import type { RootState } from '../../core/store';

import { Alert, Box, Container, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { isRejection, rejectionMessage, useEventPageGetEventQuery } from '../../gql';
import { useSecretSantaSuggestion } from '../../hooks';
import { Description } from '../common/Description';
import { SEO } from '../SEO';
import { EventAttendeesDialog } from './EventAttendeesDialog';
import { EventHeader } from './EventHeader';
import { EventHeaderSkeleton } from './EventHeaderSkeleton';
import { EventNotFound } from './EventNotFound';
import { EventWishlists } from './EventWishlists';
import { canEditEvent } from './event-permissions';
import { MySecretSantaDraw } from './MySecretSantaDraw';
import { SecretSantaSuggestionCard } from './SecretSantaSuggestionCard';

const mapState = (state: RootState) => state.auth.user?.id;

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
  const { shouldShowSuggestion, dismissSuggestion } = useSecretSantaSuggestion({
    eventId: eventId,
    eventTitle: event?.title,
    eventDate: event?.eventDate,
    currentUserCanEdit,
  });

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
              <Stack gap="20px" sx={{ paddingTop: 3 }}>
                <EventWishlists loading />
              </Stack>
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
              eventId={event.id}
              eventDate={event.eventDate}
              attendees={attendees}
              currentUserCanEdit={currentUserCanEdit}
              openAttendeesDialog={() => setOpenAttendeesDialog(true)}
            />

            <Container maxWidth="lg">
              <Stack gap="20px" sx={{ paddingTop: 3 }}>
                {shouldShowSuggestion && <SecretSantaSuggestionCard eventId={event.id} onDismiss={dismissSuggestion} />}

                <MySecretSantaDraw
                  eventId={event.id}
                  eventTitle={event.title}
                  eventDate={event.eventDate}
                  currentUserId={currentUserId}
                />

                {event.description && <Description text={event.description} />}

                <EventWishlists eventId={event.id} wishlists={event.wishlists} />
              </Stack>
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
