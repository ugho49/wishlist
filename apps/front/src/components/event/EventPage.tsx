import type { AttendeeDto } from '@wishlist/common'

import type { RootState } from '../../core'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EditIcon from '@mui/icons-material/Edit'
import ForestIcon from '@mui/icons-material/Forest'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Chip, Stack } from '@mui/material'
import { canEditEvent } from '@wishlist/common'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { useEventById } from '../../hooks'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EventAttendeesDialog } from './EventAttendeesDialog'
import { EventNotFound } from './EventNotFound'
import { EventWishlists } from './EventWishlists'
import { MySecretSantaDraw } from './MySecretSantaDraw'

const mapState = (state: RootState) => state.auth.user?.id

type HeaderProps = {
  eventDate: string
  eventId: string
  attendees: AttendeeDto[]
  currentUserCanEdit: boolean
  openAttendeesDialog: () => void
}

const Header = ({ eventDate, eventId, attendees, currentUserCanEdit, openAttendeesDialog }: HeaderProps) => {
  const navigate = useNavigate()

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      flexWrap="wrap"
      sx={{ marginBottom: '20px' }}
      gap={1}
    >
      <Stack direction="row" gap={1}>
        <Chip
          variant="outlined"
          size="small"
          icon={<AccessTimeIcon />}
          label={DateTime.fromISO(eventDate).toLocaleString(DateTime.DATE_HUGE)}
        />
        <Chip
          variant="outlined"
          size="small"
          icon={<PeopleIcon />}
          onClick={() => openAttendeesDialog()}
          label={`${attendees.length} ${attendees.length > 1 ? 'participants' : 'participant'}`}
        />
      </Stack>
      {currentUserCanEdit && (
        <Stack direction="row" gap={1}>
          <Chip
            color="success"
            variant="outlined"
            size="small"
            icon={<ForestIcon />}
            onClick={() => navigate(`/events/${eventId}/secret-santa`)}
            label="Secret Santa"
          />
          <Chip
            color="info"
            variant="outlined"
            size="small"
            icon={<EditIcon />}
            onClick={() => navigate(`/events/${eventId}/edit`)}
            label="Modifier"
          />
        </Stack>
      )}
    </Stack>
  )
}

export const EventPage = () => {
  const currentUserId = useSelector(mapState)
  const params = useParams<'eventId'>()
  const eventId = params.eventId || ''
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false)
  const { event, loading } = useEventById(eventId)

  const attendees = useMemo(() => event?.attendees || [], [event])
  const currentUserCanEdit = useMemo(() => canEditEvent(attendees, currentUserId ?? ''), [attendees, currentUserId])

  return (
    <Box>
      <Loader loading={loading}>
        {!event && <EventNotFound />}
        {event && (
          <>
            <Title smallMarginBottom>{event.title}</Title>

            <Header
              eventId={event.id}
              eventDate={event.event_date}
              attendees={attendees}
              currentUserCanEdit={currentUserCanEdit}
              openAttendeesDialog={() => setOpenAttendeesDialog(true)}
            />

            <MySecretSantaDraw eventId={event.id} />

            {event.description && <Description text={event.description} />}

            <EventWishlists event={event} />

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
