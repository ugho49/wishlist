import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupIcon from '@mui/icons-material/Group'
import InfoIcon from '@mui/icons-material/Info'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import TuneIcon from '@mui/icons-material/Tune'
import { LoadingButton } from '@mui/lab'
import { Avatar, Button, Chip, IconButton, Stack, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SecretSantaDrawService } from '@wishlist/common'
import { DetailedEventDto, SecretSantaDto, SecretSantaStatus, UpdateSecretSantaInputDto } from '@wishlist/common-types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { ConfirmButton } from '../common/ConfirmButton'
import { ConfirmIconButton } from '../common/ConfirmIconButton'
import { AddSecretSantaUsersFormDialog } from './AddSecretSantaUsersFormDialog'
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog'
import { ManageUserExclusionsDialog } from './ManageUserExclusionsDialog'

type SecretSantaProps = {
  secretSanta: SecretSantaDto
  event: DetailedEventDto
}

const eurosFormatter = Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export const SecretSanta = ({ secretSanta, event }: SecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openSecretSantaUsersModal, setOpenSecretSantaUsersModal] = useState(false)
  const [status, setStatus] = useState(secretSanta.status)
  const [description, setDescription] = useState(secretSanta.description)
  const [budget, setBudget] = useState(secretSanta.budget)
  const [currentUserIdModalExclusion, setCurrentUserIdModalExclusion] = useState<string | undefined>()
  const [secretSantaUsers, setSecretSantaUsers] = useState(secretSanta.users || [])
  const eventAttendees = useMemo(() => event.attendees || [], [event])
  const eventId = event.id

  useEffect(() => {
    setStatus(secretSanta.status)
    setDescription(secretSanta.description)
    setBudget(secretSanta.budget)
    setSecretSantaUsers(secretSanta.users || [])
  }, [secretSanta])

  const { mutateAsync: startSecretSantaMutation, isPending: loadingStart } = useMutation({
    mutationKey: ['secret-santa.start', { id: secretSanta.id }],
    mutationFn: () => api.secretSanta.start(secretSanta.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async () => {
      addToast({
        message:
          'Le tirage a été effectué, chaque participant vas recevoir un email avec le résultat du tirage qui lui est associé',
        variant: 'success',
      })
      setStatus(SecretSantaStatus.STARTED)
      await queryClient.invalidateQueries({ queryKey: ['secret-santa', { eventId }] })
    },
  })

  const { mutateAsync: updateSecretSanta, isPending: loadingUpdate } = useMutation({
    mutationKey: ['secret-santa.update', { id: secretSanta.id }],
    mutationFn: (input: UpdateSecretSantaInputDto) => api.secretSanta.update(secretSanta.id, input),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async (_, input) => {
      setBudget(input.budget)
      setDescription(input.description)
      addToast({ message: 'Le secret santa a été modifié', variant: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['secret-santa', { eventId }] })
    },
  })

  const { mutateAsync: cancelSecretSanta, isPending: loadingCancel } = useMutation({
    mutationKey: ['secret-santa.cancel', { id: secretSanta.id }],
    mutationFn: () => api.secretSanta.cancel(secretSanta.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async () => {
      addToast({ message: 'Le tirage a été annulé', variant: 'success' })
      setStatus(SecretSantaStatus.CREATED)
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

  const { mutateAsync: removeSecretSantaUser, isPending: loadingRemoveUser } = useMutation({
    mutationKey: ['secret-santa.user.remove', { secretSantaId: secretSanta.id }],
    mutationFn: (secretSantaUserId: string) => api.secretSanta.deleteUser(secretSanta.id, secretSantaUserId),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async (_, secretSantaUserId) => {
      setSecretSantaUsers(prev => prev.filter(u => u.id !== secretSantaUserId))
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
    () => loadingStart || loadingCancel || loadingDelete || loadingUpdate || loadingRemoveUser,
    [loadingStart, loadingCancel, loadingDelete, loadingUpdate, loadingRemoveUser],
  )

  return (
    <Stack>
      <>
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
          eventId={eventId}
          eventAttendees={eventAttendees}
          secretSantaAttendees={secretSantaUsers.map(u => u.attendee)}
        />

        <ManageUserExclusionsDialog
          open={currentUserIdModalExclusion !== undefined}
          eventId={eventId}
          secretSantaId={secretSanta.id}
          secretSantaUser={secretSantaUsers.find(u => u.id === currentUserIdModalExclusion)}
          handleClose={() => setCurrentUserIdModalExclusion(undefined)}
          otherSecretSantaUser={secretSantaUsers.filter(u => u.id !== currentUserIdModalExclusion)}
        />
      </>
      <Stack flexDirection="row" alignItems="start" justifyContent="space-between" mb={4}>
        <Stack alignItems="start" gap={1}>
          <Stack flexDirection="row" alignItems="center" gap={1}>
            <Chip
              variant="outlined"
              size="small"
              icon={status === SecretSantaStatus.CREATED ? <InfoIcon /> : <CheckCircleIcon />}
              label={status === SecretSantaStatus.CREATED ? 'Brouillon' : 'Tirage effectué'}
            />
            <Chip
              variant="outlined"
              size="small"
              icon={<GroupIcon />}
              label={`${secretSantaUsers.length} participant${secretSantaUsers.length > 1 ? 's' : ''}`}
            />
          </Stack>
          {budget && (
            <Chip
              variant="outlined"
              size="small"
              icon={<AccountBalanceIcon />}
              label={`Budget Max: ${eurosFormatter.format(budget)}`}
            />
          )}
        </Stack>
        <Stack flexDirection="row" alignItems="center" gap={4}>
          {status === SecretSantaStatus.CREATED && (
            <>
              <Stack flexDirection="row" alignItems="center" gap={0.5}>
                <ConfirmButton
                  confirmTitle="Confirmer la suppression du secret santa"
                  confirmText="Êtes-vous sûr de vouloir supprimer le secret santa ? Cette action est irréversible."
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  loading={loading}
                  disabled={loading}
                  onClick={() => deleteSecretSanta()}
                >
                  Supprimer
                </ConfirmButton>

                <LoadingButton
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<TuneIcon />}
                  loading={loading}
                  disabled={loading}
                  onClick={() => setOpenEditModal(true)}
                >
                  Modifier
                </LoadingButton>
              </Stack>

              <ConfirmButton
                confirmTitle="Confirmer le lancement du tirage"
                confirmText="Êtes-vous sûr de vouloir lancer le tirage ?"
                variant="contained"
                color="info"
                size="small"
                endIcon={<ArrowRightAltIcon />}
                loading={loading}
                disabled={loading}
                onClick={() => startSecretSanta()}
              >
                Lancer le tirage
              </ConfirmButton>
            </>
          )}

          {status === SecretSantaStatus.STARTED && (
            <ConfirmButton
              confirmTitle="Confirmer l'annulation du tirage"
              confirmText="Êtes-vous sûr de vouloir annuler le tirage ? Cette action est irréversible."
              variant="text"
              color="error"
              loading={loading}
              disabled={loading}
              onClick={() => cancelSecretSanta()}
            >
              Annuler le tirage
            </ConfirmButton>
          )}
        </Stack>
      </Stack>

      <Stack>
        <Button
          fullWidth
          variant="text"
          disabled={status === SecretSantaStatus.STARTED}
          onClick={() => setOpenSecretSantaUsersModal(true)}
          startIcon={<PersonAddAltIcon />}
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
            exclusions: u.exclusions.length,
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
            { field: 'exclusions', headerName: 'Exclusions', headerAlign: 'center', align: 'center', width: 100 },
            {
              field: 'id',
              sortable: false,
              filterable: false,
              headerName: 'Actions',
              display: 'flex',
              headerAlign: 'center',
              align: 'center',
              flex: 1,
              renderCell: ({ row }) => (
                <>
                  {status === SecretSantaStatus.CREATED && (
                    <Stack flexDirection="row" gap={1}>
                      {secretSantaUsers.length > 1 && (
                        <IconButton color="info" size="small" onClick={() => setCurrentUserIdModalExclusion(row.id)}>
                          <Tooltip title="Gérer les exclusions">
                            <PersonOffIcon />
                          </Tooltip>
                        </IconButton>
                      )}
                      <ConfirmIconButton
                        confirmTitle="Supprimer le participant"
                        confirmText={`Êtes-vous sûr de vouloir supprimer ce participant ?`}
                        onClick={() => removeSecretSantaUser(row.id)}
                        disabled={loading}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </ConfirmIconButton>
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
      </Stack>

      {/*<Stack>*/}
      {/*  <Box>*/}
      {/*    <b>Status:</b>*/}
      {/*    <span>{status}</span>*/}
      {/*  </Box>*/}
      {/*  <Box>*/}
      {/*    <b>Description:</b>*/}
      {/*    <span>{description}</span>*/}
      {/*  </Box>*/}
      {/*  <Box>*/}
      {/*    <b>Budget Max:</b>*/}
      {/*    <span>{budget ?? '-'}€</span>*/}
      {/*  </Box>*/}
      {/*</Stack>*/}
    </Stack>
  )
}
