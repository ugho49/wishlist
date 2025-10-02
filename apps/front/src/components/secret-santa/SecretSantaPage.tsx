import type { EventId } from '@wishlist/common'

import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { useEventById, useSecretSanta } from '../../hooks'
import { Route } from '../../routes/_authenticated/events.$eventId.secret-santa'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { NoSecretSanta } from './NoSecretSanta'
import { SecretSanta } from './SecretSanta'

export const SecretSantaPage = () => {
  const { eventId } = Route.useParams()
  const { secretSanta, loading: loadingSecretSanta } = useSecretSanta(eventId)
  const { event, loading: loadingEvent } = useEventById(eventId)
  const navigate = useNavigate()
  const loading = loadingSecretSanta || loadingEvent

  useEffect(() => {
    if (!loadingEvent && !event) {
      navigate({ to: '/events' })
    }
  }, [event, loadingEvent, navigate])

  return (
    <Box>
      <Title smallMarginBottom>Secret Santa</Title>
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
