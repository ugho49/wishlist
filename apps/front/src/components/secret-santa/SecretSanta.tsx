import { LoadingButton } from '@mui/lab'
import { Box, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SecretSantaDto, SecretSantaStatus } from '@wishlist/common-types'
import React from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'

type SecretSantaProps = {
  secretSanta: SecretSantaDto
  eventId: string
}

export const SecretSanta = ({ secretSanta, eventId }: SecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()

  const { mutateAsync: cancelSecretSanta, isPending: loadingCancel } = useMutation({
    mutationKey: ['secret-santa.cancel', { id: secretSanta.id }],
    mutationFn: () => api.secretSanta.cancel(secretSanta.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async () => {
      addToast({ message: 'Secret santa annulé avec succès', variant: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['secret-santa', { eventId }] })
    },
  })

  const { mutateAsync: deleteSecretSanta, isPending: loadingDelete } = useMutation({
    mutationKey: ['secret-santa.delete', { id: secretSanta.id }],
    mutationFn: () => api.secretSanta.delete(secretSanta.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async () => {
      addToast({ message: 'Secret santa supprimé avec succès', variant: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['secret-santa', { eventId }] })
    },
  })

  return (
    <Stack>
      <Box>
        <b>Status:</b>
        <span>{secretSanta.status}</span>
      </Box>
      <Box>
        <b>Description:</b>
        <span>{secretSanta.description}</span>
      </Box>
      <Box>
        <b>Budget Max:</b>
        <span>{secretSanta.budget ?? '-'}€</span>
      </Box>
      {secretSanta.status === SecretSantaStatus.CREATED && (
        <LoadingButton loading={loadingDelete} disabled={loadingDelete} onClick={() => deleteSecretSanta()}>
          Supprimer le secret santa
        </LoadingButton>

        //TODO: add button to start secret santa
      )}

      {secretSanta.status === SecretSantaStatus.STARTED && (
        <LoadingButton loading={loadingCancel} disabled={loadingCancel} onClick={() => cancelSecretSanta()}>
          Annuler le secret santa
        </LoadingButton>
      )}
    </Stack>
  )
}
