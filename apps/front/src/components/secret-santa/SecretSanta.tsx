import { LoadingButton } from '@mui/lab'
import { Avatar, Box, Button, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SecretSantaDrawService } from '@wishlist/common'
import { SecretSantaDto, SecretSantaStatus, UpdateSecretSantaInputDto } from '@wishlist/common-types'
import React, { useCallback, useMemo, useState } from 'react'

import { useEventById } from '../../hooks/domain/useEventById'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { ConfirmButton } from '../common/ConfirmButton'
import { AddSecretSantaUsersFormDialog } from './AddSecretSantaUsersFormDialog'
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog'

type SecretSantaProps = {
  secretSanta: SecretSantaDto
  eventId: string
}

export const SecretSanta = ({ secretSanta, eventId }: SecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openSecretSantaUsersModal, setOpenSecretSantaUsersModal] = useState(false)
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

  const { mutateAsync: removeSecretSantaUser, isPending: loadingRemoveUser } = useMutation({
    mutationKey: ['secret-santa.user.remove', { id: secretSanta.id }],
    mutationFn: (secretSantaUserId: string) => api.secretSanta.deleteUser(secretSanta.id, secretSantaUserId),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_, secretSantaUserId) => {
      setSecretSantaUsers(prev => prev.filter(u => u.id !== secretSantaUserId))
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
    () => loadingStart || loadingCancel || loadingDelete || loadingUpdate || loadingRemoveUser,
    [loadingStart, loadingCancel, loadingDelete, loadingUpdate, loadingRemoveUser],
  )

  return (
    <Stack>
      {status === SecretSantaStatus.CREATED && (
        <Stack gap={2} flexDirection="row" mb={4} justifyContent="center">
          <EditSecretSantaFormDialog
            title="Modifier le secret santa"
            open={openEditModal}
            saveButtonText="Modifier"
            handleSubmit={input => {
              setOpenEditModal(false)
              void updateSecretSanta(input)
            }}
            handleClose={() => setOpenEditModal(false)}
            input={{ budget, description }}
          />

          <AddSecretSantaUsersFormDialog
            open={openSecretSantaUsersModal}
            handleSubmit={newSecretSantaUsers => {
              setSecretSantaUsers(prev => [...prev, ...newSecretSantaUsers])
              setOpenSecretSantaUsersModal(false)
            }}
            handleClose={() => setOpenSecretSantaUsersModal(false)}
            secretSantaId={secretSanta.id}
            eventAttendees={eventAttendees}
            secretSantaAttendees={secretSantaUsers.map(u => u.attendee)}
          />

          <ConfirmButton
            confirmTitle="Confirmer le lancement du tirage"
            confirmText="Êtes-vous sûr de vouloir lancer le tirage ?"
            variant="contained"
            color="info"
            loading={loading}
            disabled={loading}
            onClick={() => startSecretSanta()}
          >
            Lancer le tirage
          </ConfirmButton>

          <LoadingButton
            variant="contained"
            color="primary"
            loading={loading}
            disabled={loading}
            onClick={() => setOpenEditModal(true)}
          >
            Modifier le secret santa
          </LoadingButton>

          <ConfirmButton
            confirmTitle="Confirmer la suppression du secret santa"
            confirmText="Êtes-vous sûr de vouloir supprimer le secret santa ? Cette action est irréversible."
            variant="contained"
            color="error"
            loading={loading}
            disabled={loading}
            onClick={() => deleteSecretSanta()}
          >
            Supprimer le secret santa
          </ConfirmButton>
        </Stack>
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
          <Button
            variant="contained"
            disabled={status === SecretSantaStatus.STARTED}
            onClick={() => setOpenSecretSantaUsersModal(true)}
          >
            Ajouter un participant
          </Button>
          <DataGrid
            localeText={{
              noRowsLabel: 'Aucun participant',
            }}
            rows={secretSantaUsers.map(u => ({
              id: u.id,
              firstname: u.attendee.user?.firstname,
              lastname: u.attendee.user?.lastname,
              email: u.attendee.user?.email ?? u.attendee.pending_email,
              pictureUrl: u.attendee.user?.picture_url,
            }))}
            columns={[
              {
                field: 'pictureUrl',
                headerName: '',
                sortable: false,
                filterable: false,
                width: 60,
                display: 'flex',
                align: 'center',
                renderCell: ({ row }) => <Avatar src={row.pictureUrl} sx={{ width: '30px', height: '30px' }} />,
              },
              { field: 'firstname', headerName: 'Prénom', width: 170, valueGetter: value => value ?? '-' },
              { field: 'lastname', headerName: 'Nom', width: 170, valueGetter: value => value ?? '-' },
              { field: 'email', headerName: 'Email', width: 250 },
              {
                field: 'id',
                sortable: false,
                filterable: false,
                headerName: '',
                flex: 1,
                display: 'flex',
                headerAlign: 'center',
                align: 'center',
                renderCell: ({ row }) => (
                  <>
                    {status === SecretSantaStatus.CREATED && (
                      <Stack>
                        <Button color="info" size="small">
                          Gérer les exclusions
                        </Button>
                        <ConfirmButton
                          confirmTitle="Confirmer la suppression du participant"
                          confirmText={`Êtes-vous sûr de vouloir supprimer ${row.firstname} ${row.lastname} ?`} //TODO: change this text
                          onClick={() => removeSecretSantaUser(row.id)}
                          disabled={loading}
                          loading={loading}
                          size="small"
                          color="error"
                        >
                          Supprimer
                        </ConfirmButton>
                      </Stack>
                    )}
                  </>
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
