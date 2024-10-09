import type { UpdateSecretSantaInputDto } from '@wishlist/common-types'

import { LoadingButton } from '@mui/lab'
import { Box, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SecretSantaDrawService } from '@wishlist/common'
import { SecretSantaDto, SecretSantaStatus } from '@wishlist/common-types'
import React, { useCallback, useMemo, useState } from 'react'

import { useEventById } from '../../hooks/domain/useEventById'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { ConfirmButton } from '../common/ConfirmButton'
import { RouterLink } from '../common/RouterLink'
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog'

type SecretSantaProps = {
  secretSanta: SecretSantaDto
  eventId: string
}

export const SecretSanta = ({ secretSanta, eventId }: SecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()
  const [openModal, setOpenModal] = useState(false)
  const [status, setStatus] = useState(secretSanta.status)
  const [description, setDescription] = useState(secretSanta.description)
  const [budget, setBudget] = useState(secretSanta.budget)
  const [secretSantaUsers, setSecretSantaUsers] = useState(secretSanta.users || [])
  const event = useEventById(eventId)
  const eventAttendees = useMemo(() => event.event?.attendees || [], [event])

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

  const { mutateAsync: updateSecretSanta, isPending: loadingUpdate } = useMutation({
    mutationKey: ['secret-santa.update', { id: secretSanta.id }],
    mutationFn: (input: UpdateSecretSantaInputDto) => api.secretSanta.update(secretSanta.id, input),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_, input) => {
      setBudget(input.budget)
      setDescription(input.description)
      addToast({ message: 'Le secret santa a été modifié', variant: 'success' })
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
    const secretSantaService = new SecretSantaDrawService(secretSantaUsers)
    const { reason, isPossible } = secretSantaService.isDrawPossible()

    if (!isPossible) {
      addToast({ message: reason, variant: 'warning' })
      return
    }

    await startSecretSantaMutation()
  }, [secretSantaUsers])

  const loading = useMemo(
    () => loadingStart || loadingCancel || loadingDelete || loadingUpdate,
    [loadingStart, loadingCancel, loadingDelete, loadingUpdate],
  )

  return (
    <Stack>
      {status === SecretSantaStatus.CREATED && (
        <>
          <EditSecretSantaFormDialog
            title="Modifier le secret santa"
            open={openModal}
            saveButtonText="Modifier"
            handleSubmit={input => {
              setOpenModal(false)
              void updateSecretSanta(input)
            }}
            handleClose={() => setOpenModal(false)}
            input={{ budget, description }}
          />

          <LoadingButton loading={loading} disabled={loading} onClick={() => setOpenModal(true)}>
            Modifier le secret santa
          </LoadingButton>

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

      <Stack>
        <Box>
          <b>Status:</b>
          <span>{status}</span>
        </Box>
        <Box>
          <b>Description:</b>
          <span>{description}</span>
        </Box>
        <Box>
          <b>Budget Max:</b>
          <span>{budget ?? '-'}€</span>
        </Box>
        <Box>
          <b>Participants:</b>
          <DataGrid
            rows={secretSantaUsers} // TODO map this
            columns={[
              { field: 'firstname', headerName: 'Prénom', width: 150 },
              { field: 'lastname', headerName: 'Nom', width: 150 },
              { field: 'email', headerName: 'Email', width: 250 },
              {
                field: 'id',
                sortable: false,
                filterable: false,
                headerName: '',
                flex: 1,
                headerAlign: 'center',
                align: 'center',
                renderCell: ({ row: user }) => (
                  // TODO: change this
                  <RouterLink to={`/admin/users/${user.id}`}>Voir les exclusions</RouterLink>
                ),
              },
            ]}
            hideFooter
            autoHeight
            disableColumnMenu
          />
        </Box>
      </Stack>
    </Stack>
  )
}
