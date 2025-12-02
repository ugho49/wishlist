import type { EventId } from '@wishlist/common'
import type { RootState } from '../../core'

import { Box, Container, Stack } from '@mui/material'
import { canEditEvent } from '@wishlist/common'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventById, useSecretSantaSuggestion } from '../../hooks'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { SEO } from '../SEO'
import { EventAttendeesDialog } from './EventAttendeesDialog'
import { EventHeader } from './EventHeader'
import { EventNotFound } from './EventNotFound'
import { EventWishlists } from './EventWishlists'
import { MySecretSantaDraw } from './MySecretSantaDraw'
import { SecretSantaSuggestionCard } from './SecretSantaSuggestionCard'

const mapState = (state: RootState) => state.auth.user?.id

interface EventPageProps {
  eventId: EventId
}

export const EventPage = ({ eventId }: EventPageProps) => {
  const currentUserId = useSelector(mapState)
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false)
  const { event, loading } = useEventById(eventId)

  const attendees = useMemo(() => event?.attendees || [], [event])
  const currentUserCanEdit = useMemo(() => canEditEvent(attendees, currentUserId ?? ''), [attendees, currentUserId])
  const { shouldShowSuggestion, dismissSuggestion } = useSecretSantaSuggestion({
    eventId: eventId,
    eventTitle: event?.title,
    eventDate: event?.event_date,
    currentUserCanEdit,
  })

  return (
    <>
      <SEO
        title={event?.title || 'Événement'}
        description={`Consultez les listes de souhaits pour l'événement ${event?.title || ''}.`}
        canonical={`/events/${eventId}`}
      />
      <Box>
        <Loader loading={loading}>
          {!event && <EventNotFound />}
          {event && (
            <>
              <EventHeader
                icon={event.icon}
                title={event.title}
                eventId={event.id}
                eventDate={event.event_date}
                attendees={attendees}
                currentUserCanEdit={currentUserCanEdit}
                openAttendeesDialog={() => setOpenAttendeesDialog(true)}
              />

              <Container maxWidth="lg">
                <Stack gap="20px" sx={{ paddingTop: 3 }}>
                  {shouldShowSuggestion && (
                    <SecretSantaSuggestionCard eventId={event.id} onDismiss={dismissSuggestion} />
                  )}

                  <MySecretSantaDraw eventId={event.id} />

                  {event.description && <Description text={event.description} allowMarkdown />}

                  <EventWishlists event={event} />
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
        </Loader>
      </Box>
    </>
  )
}
