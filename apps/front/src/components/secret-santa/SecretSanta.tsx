import { Box, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SecretSantaDrawService } from '@wishlist/common'
import { SecretSantaDto, SecretSantaStatus } from '@wishlist/common-types'
import React, { useCallback, useMemo, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { ConfirmButton } from '../common/ConfirmButton'

type SecretSantaProps = {
  secretSanta: SecretSantaDto
  eventId: string
}

export const SecretSanta = ({ secretSanta, eventId }: SecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()
  const [status, setStatus] = useState(secretSanta.status)
  const [users, setUsers] = useState(secretSanta.users || [])

  const { mutateAsync: startSecretSantaMutation, isPending: loadingStart } = useMutation({
    mutationKey: ['secret-santa.start', { id: secretSanta.id }],
    mutationFn: () => api.secretSanta.start(secretSanta.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({
        message:
          'Le tirage a été effectué, chaque participant vas recevoir un email avec le résultat du tirage qui lui est associé',
        variant: 'success',
      })
      setStatus(SecretSantaStatus.STARTED)
    },
  })

  const { mutateAsync: cancelSecretSanta, isPending: loadingCancel } = useMutation({
    mutationKey: ['secret-santa.cancel', { id: secretSanta.id }],
    mutationFn: () => api.secretSanta.cancel(secretSanta.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Le tirage a été annulé', variant: 'success' })
      setStatus(SecretSantaStatus.CREATED)
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

  const startSecretSanta = useCallback(async () => {
    const secretSantaService = new SecretSantaDrawService(users)
    const { reason, isPossible } = secretSantaService.isDrawPossible()

    if (!isPossible) {
      addToast({ message: reason, variant: 'warning' })
      return
    }

    await startSecretSantaMutation()
  }, [users])

  const loading = useMemo(
    () => loadingStart || loadingCancel || loadingDelete,
    [loadingStart, loadingCancel, loadingDelete],
  )

  return (
    <Stack>
      <Box>
        <b>Status:</b>
        <span>{status}</span>
      </Box>
      <Box>
        <b>Description:</b>
        <span>{secretSanta.description}</span>
      </Box>
      <Box>
        <b>Budget Max:</b>
        <span>{secretSanta.budget ?? '-'}€</span>
      </Box>
      {status === SecretSantaStatus.CREATED && (
        <>
          <ConfirmButton
            confirmTitle="Confirmer le lancement du tirage"
            confirmText="Êtes-vous sûr de vouloir lancer le tirage ?"
            loading={loading}
            disabled={loading}
            onClick={() => startSecretSanta()}
          >
            Lancer le tirage
          </ConfirmButton>

          <ConfirmButton
            confirmTitle="Confirmer la suppression du secret santa"
            confirmText="Êtes-vous sûr de vouloir supprimer le secret santa ? Cette action est irréversible."
            loading={loading}
            disabled={loading}
            onClick={() => deleteSecretSanta()}
          >
            Supprimer le secret santa
          </ConfirmButton>
        </>
      )}

      {status === SecretSantaStatus.STARTED && (
        <ConfirmButton
          confirmTitle="Confirmer l'annulation du tirage"
          confirmText="Êtes-vous sûr de vouloir annuler le tirage ? Cette action est irréversible."
          loading={loading}
          disabled={loading}
          onClick={() => cancelSecretSanta()}
        >
          Annuler le tirage
        </ConfirmButton>
      )}
    </Stack>
  )
}
