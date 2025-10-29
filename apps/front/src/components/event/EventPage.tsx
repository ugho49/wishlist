import type { RootState } from '../../core'

import { Box, Container, Stack } from '@mui/material'
import { canEditEvent, type EventId } from '@wishlist/common'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useEventById, useSecretSantaSuggestion } from '../../hooks'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { EventAttendeesDialog } from './EventAttendeesDialog'
import { EventHeader } from './EventHeader'
import { EventNotFound } from './EventNotFound'
import { EventWishlists } from './EventWishlists'
import { MySecretSantaDraw } from './MySecretSantaDraw'
import { SecretSantaSuggestionCard } from './SecretSantaSuggestionCard'

const mapState = (state: RootState) => state.auth.user?.id

export const EventPage = () => {
  const currentUserId = useSelector(mapState)
  const params = useParams<'eventId'>()
  const eventId = (params.eventId || '') as EventId
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
              <Stack gap="20px">
                {shouldShowSuggestion && <SecretSantaSuggestionCard eventId={event.id} onDismiss={dismissSuggestion} />}

                <MySecretSantaDraw eventId={event.id} />

                {event.description && <Description text={event.description} />}

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
  )
}
