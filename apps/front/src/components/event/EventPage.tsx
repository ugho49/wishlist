import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EditIcon from '@mui/icons-material/Edit'
import ForestIcon from '@mui/icons-material/Forest'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Chip, Stack } from '@mui/material'
import { canEditEvent } from '@wishlist/common-types'
import { DateTime } from 'luxon'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { RootState } from '../../core'
import { useEventById } from '../../hooks/domain/useEventById'
import { FEATURE_FLAGS, useFeatureFlag } from '../../hooks/useFeatureFlag'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EventAttendeesDialog } from './EventAttendeesDialog'
import { EventNotFound } from './EventNotFound'
import { EventWishlists } from './EventWishlists'

const mapState = (state: RootState) => state.auth.user?.id

export const EventPage = () => {
  const currentUserId = useSelector(mapState)
  const params = useParams<'eventId'>()
  const eventId = params.eventId || ''
  const navigate = useNavigate()
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false)
  const { event, loading } = useEventById(eventId)
  const secretSantaEnabled = true //useFeatureFlag(FEATURE_FLAGS.SECRET_SANTA_ENABLED)
  const attendees = useMemo(() => event?.attendees || [], [event])
  const currentUserCanEdit = useMemo(() => canEditEvent(attendees, currentUserId ?? ''), [attendees, currentUserId])

  return (
    <Box>
      <Loader loading={loading}>
        {!event && <EventNotFound />}
        {event && (
          <>
            <Title smallMarginBottom>{event.title}</Title>

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
                  label={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_HUGE)}
                />
                <Chip
                  variant="outlined"
                  size="small"
                  icon={<PeopleIcon />}
                  onClick={() => setOpenAttendeesDialog(true)}
                  label={`${attendees.length} ${attendees.length > 1 ? 'participants' : 'participant'}`}
                />
              </Stack>
              {currentUserCanEdit && (
                <Stack direction="row" gap={1}>
                  {secretSantaEnabled && (
                    <Chip
                      color="success"
                      variant="filled"
                      size="medium"
                      sx={{ boxShadow: '0 0 0px 0 rgba(87, 113, 149, 0.3),0 2px 3px 1px rgba(87, 113, 149, 0.5)' }}
                      icon={<ForestIcon fontSize="small" />}
                      onClick={() => navigate(`/events/${eventId}/secret-santa`)}
                      label="Secret Santa"
                    />
                  )}
                  <Chip
                    color="info"
                    variant="filled"
                    size="medium"
                    sx={{ boxShadow: '0 0 0px 0 rgba(87, 113, 149, 0.3),0 2px 3px 1px rgba(87, 113, 149, 0.5)' }}
                    icon={<EditIcon fontSize="small" />}
                    onClick={() => navigate(`/events/${eventId}/edit`)}
                    label="Modifier"
                  />
                </Stack>
              )}
            </Stack>

            {event.description && <Description text={event.description} />}

            <EventWishlists event={event} />

            <EventAttendeesDialog
              open={openAttendeesDialog}
              handleClose={() => setOpenAttendeesDialog(false)}
              currentUserCanEdit={currentUserCanEdit}
              eventId={event.id}
              attendees={event.attendees}
            />
          </>
        )}
      </Loader>
    </Box>
  )
}
