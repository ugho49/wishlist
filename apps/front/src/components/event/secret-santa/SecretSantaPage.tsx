import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Box, Stack } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useEventById } from '../../../hooks/domain/useEventById'
import { useApi } from '../../../hooks/useApi'
import { Loader } from '../../common/Loader'
import { Title } from '../../common/Title'
import { EventNotFound } from '../EventNotFound'

export const SecretSantaPage = () => {
  const params = useParams<'eventId'>()
  const eventId = params.eventId || ''
  const { event, loading } = useEventById(eventId)
  const api = useApi()
  const queryClient = useQueryClient()

  const { data: secretSanta, isLoading: secretSantaIsLoading } = useQuery({
    queryKey: ['secret-santa', { id: eventId ?? 'undefined' }],
    queryFn: () => {
      if (!eventId) throw new Error('eventId is required')
      return api.secretSanta.get(eventId)
    },
  })

  const { mutateAsync: createSecretSanta, isPending: createSecretSantaIsLoading } = useMutation({
    mutationKey: ['secret-santa.create'],
    mutationFn: async () => {
      await api.secretSanta.create({ event_id: eventId || '' }) // TODO : add other params
      await queryClient.invalidateQueries({ queryKey: ['events', { id: eventId ?? 'undefined' }] })
    },
    // onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    // onSuccess: output => {
    //   addToast({ message: 'Evènement créé avec succès', variant: 'success' })
    //
    //   navigate(`/events/${output.id}`)
    // },
  })

  return (
    <Box>
      <Loader loading={loading && secretSantaIsLoading}>
        {!event && <EventNotFound />}
        {event && (
          <>
            <Title smallMarginBottom goBackLink={{ to: `/events/${eventId}`, title: "Revenir à l'évènement" }}>
              Gérer le Secret Santa
            </Title>
            {!secretSanta && (
              <Stack>
                <Box>Aucun secret Santa activé pour cet évènement</Box>
                <LoadingButton
                  fullWidth
                  variant="contained"
                  size="large"
                  color="secondary"
                  loading={createSecretSantaIsLoading}
                  loadingPosition="start"
                  disabled={createSecretSantaIsLoading}
                  startIcon={<SaveIcon />}
                  onClick={() => createSecretSanta()}
                >
                  Créer un Secret Santa
                </LoadingButton>
              </Stack>
            )}
            {secretSanta && <span>Secret santa {JSON.stringify(secretSanta)}</span>}
          </>
        )}
      </Loader>
    </Box>
  )
}
