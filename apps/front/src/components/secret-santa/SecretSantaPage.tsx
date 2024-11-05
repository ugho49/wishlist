import type { EventId } from '@wishlist/common-types'

import { Box } from '@mui/material'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useEventById, useSecretSanta } from '../../hooks'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { NoSecretSanta } from './NoSecretSanta'
import { SecretSanta } from './SecretSanta'

export const SecretSantaPage = () => {
  const params = useParams<'eventId'>()
  const eventId = (params.eventId || '') as EventId
  const { secretSanta, loading: loadingSecretSanta } = useSecretSanta(eventId)
  const { event, loading: loadingEvent } = useEventById(eventId)
  const navigate = useNavigate()
  const loading = loadingSecretSanta || loadingEvent

  useEffect(() => {
    if (!loadingEvent && !event) {
      navigate('/events')
    }
  }, [event, loadingEvent])

  return (
    <Box>
      <Title smallMarginBottom goBackLink={{ to: `/events/${eventId}`, title: "Revenir à l'évènement" }}>
        Secret Santa
      </Title>
      <Loader loading={loading}>
        {event && (
          <>
            {secretSanta ? (
              <SecretSanta event={event} secretSanta={secretSanta} />
            ) : (
              <NoSecretSanta eventId={eventId} />
            )}
          </>
        )}
      </Loader>
    </Box>
  )
}
