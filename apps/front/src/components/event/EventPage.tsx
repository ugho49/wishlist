import type { EventId } from '@wishlist/common'
import type { RootState } from '../../core'

import { Box, Container, Stack } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { AttendeeRole, useEventPageGetEventQuery } from '../../gql'
import { unwrapResultOrNotFound } from '../../gql/result'
import { useSecretSantaSuggestion } from '../../hooks'
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
  const { data: event, isLoading: loading } = useEventPageGetEventQuery(
    { eventId },
    { select: d => unwrapResultOrNotFound(d.event, 'Event') },
  )

  const attendees = useMemo(() => event?.attendees ?? [], [event])
  const currentUserCanEdit = useMemo(
    () => attendees.some(a => a.user?.id === currentUserId && a.role === AttendeeRole.Maintainer),
    [attendees, currentUserId],
  )
  const { shouldShowSuggestion, dismissSuggestion } = useSecretSantaSuggestion({
    eventId: eventId,
    eventTitle: event?.title,
    eventDate: event?.eventDate,
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
                  {shouldShowSuggestion && (
                    <SecretSantaSuggestionCard eventId={event.id} onDismiss={dismissSuggestion} />
                  )}

                  <MySecretSantaDraw eventId={event.id} />

                  {event.description && <Description text={event.description} allowMarkdown />}

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
        </Loader>
      </Box>
    </>
  )
}
