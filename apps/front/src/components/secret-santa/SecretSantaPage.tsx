import { Box } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useSecretSanta } from '../../hooks/domain/useSecretSanta'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { NoSecretSanta } from './NoSecretSanta'
import { SecretSanta } from './SecretSanta'

export const SecretSantaPage = () => {
  const params = useParams<'eventId'>()
  const eventId = params.eventId || ''
  const { secretSanta, loading } = useSecretSanta(eventId)

  return (
    <Box>
      <Loader loading={loading}>
        <Title smallMarginBottom goBackLink={{ to: `/events/${eventId}`, title: "Revenir à l'évènement" }}>
          Secret Santa
        </Title>

        {secretSanta ? (
          <SecretSanta eventId={eventId} secretSanta={secretSanta} />
        ) : (
          <NoSecretSanta eventId={eventId} />
        )}
      </Loader>
    </Box>
  )
}
