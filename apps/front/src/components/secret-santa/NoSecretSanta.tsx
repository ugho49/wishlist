import { LoadingButton } from '@mui/lab'
import { Box, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'

type NoSecretSantaProps = {
  eventId: string
}

export const NoSecretSanta = ({ eventId }: NoSecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()

  const { mutateAsync: createSecretSanta, isPending: loading } = useMutation({
    mutationKey: ['secret-santa.create', { eventId }],
    mutationFn: () => {
      return api.secretSanta.create({
        event_id: eventId,
        description: 'ssss', // TODO: add description
        budget: 1, // TODO: add budget
      })
    },
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      addToast({ message: 'Secret santa créé avec succès', variant: 'success' })
      queryClient.setQueryData(['secret-santa', { eventId }], output)
    },
  })

  return (
    <Stack>
      <Box>
        Aucun secret santa n'est en cours pour cet évènement. Vous pouvez en créer un en cliquant sur le bouton
        ci-dessous.
      </Box>
      <LoadingButton loading={loading} disabled={loading} onClick={() => createSecretSanta()}>
        Créer un secret santa
      </LoadingButton>
    </Stack>
  )
}
