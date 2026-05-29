import type { TransitionProps } from '@mui/material/transitions'
import type { GridColDef } from '@mui/x-data-grid'
import type { AttendeeId, EventId, SecretSantaId } from '@wishlist/common'
import type React from 'react'
import type { SecretSantaAttendee, SecretSantaUserItem } from './secret-santa.types'

import CloseIcon from '@mui/icons-material/Close'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import {
  AppBar,
  Avatar,
  Button,
  Container,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useQueryClient } from '@tanstack/react-query'
import { forwardRef, useEffect, useMemo, useState } from 'react'

import { useAddSecretSantaUsersMutation } from '../../gql'
import { GraphqlRejectionError, unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks'
import { Status } from '../common/Status'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  const { children, ...other } = props
  return (
    <Slide direction="up" ref={ref} {...other}>
      {children}
    </Slide>
  )
})

export type AddSecretSantaUsersFormDialogProps = {
  open: boolean
  eventId: EventId
  secretSantaId: SecretSantaId
  eventAttendees: SecretSantaAttendee[]
  secretSantaAttendees: SecretSantaAttendee[]
  handleSubmit: (newSecretSantaUsers: SecretSantaUserItem[]) => void
  handleClose: () => void
}

type RowType = {
  id: string
  firstname?: string
  lastname?: string
  email: string
  pictureUrl?: string
  isPending: boolean
}

const columns: GridColDef<RowType>[] = [
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
  { field: 'email', headerName: 'Email', minWidth: 250, flex: 1 },
  {
    field: 'isPending',
    headerName: 'Status',
    display: 'flex',
    sortable: true,
    filterable: false,
    width: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: ({ row }) => (
      <Status
        color={row.isPending ? 'warning' : 'success'}
        text={row.isPending ? 'Invitation en attente' : 'Inscrit'}
      />
    ),
  },
]

export const AddSecretSantaUsersFormDialog = ({
  open,
  eventId,
  secretSantaId,
  eventAttendees,
  secretSantaAttendees,
  handleSubmit,
  handleClose,
}: AddSecretSantaUsersFormDialogProps) => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [selectedIds, setSelectedIds] = useState<AttendeeId[]>([])
  const isFullscreen = useMediaQuery(theme => theme.breakpoints.down('md'))

  const { mutateAsync: addUsersMutation, isPending: loading } = useAddSecretSantaUsersMutation()

  const addUsers = async () => {
    try {
      const res = await addUsersMutation({ id: secretSantaId, input: { attendeeIds: selectedIds } })
      const output = unwrapResult(res.addSecretSantaUsers, 'AddSecretSantaUsersOutput')
      handleSubmit(output.users)
      await queryClient.invalidateQueries({ queryKey: ['GetSecretSantaForEvent', { eventId }] })
    } catch (error) {
      const message = error instanceof GraphqlRejectionError ? error.message : "Une erreur s'est produite"
      addToast({ message, variant: 'error' })
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedIds([])
    }
  }, [open])

  const rows = useMemo(() => {
    return eventAttendees
      .filter(a => !secretSantaAttendees.find(s => s.id === a.id))
      .map<RowType>(a => ({
        id: a.id,
        firstname: a.user?.firstName,
        lastname: a.user?.lastName,
        email: a.user?.email ?? a.pendingEmail ?? '',
        pictureUrl: a.user?.pictureUrl ?? undefined,
        isPending: !!a.pendingEmail,
      }))
  }, [eventAttendees, secretSantaAttendees])

  return (
    <Dialog
      fullScreen={isFullscreen}
      maxWidth="xl"
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={loading}
      slots={{ transition: Transition }}
    >
      <AppBar sx={{ position: 'sticky' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            Ajouter des participants
          </Typography>
          <IconButton edge="start" color="inherit" disabled={loading} onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: '40px' }}>
        <Stack alignItems="center">
          <Button
            disabled={loading || selectedIds.length === 0}
            loading={loading}
            variant="contained"
            color="primary"
            onClick={() => addUsers()}
            startIcon={<PersonAddAltIcon />}
          >
            Ajouter {selectedIds.length} participant{selectedIds.length > 1 ? 's' : ''}
          </Button>
        </Stack>

        <Stack direction="column">
          <DataGrid
            sx={{ marginBlock: '20px' }}
            localeText={{
              noRowsLabel: 'Aucun participant à ajouter',
            }}
            checkboxSelection
            isRowSelectable={() => !loading}
            onRowSelectionModelChange={newRowSelectionModel =>
              setSelectedIds(Array.from(newRowSelectionModel.ids) as AttendeeId[])
            }
            rows={rows}
            columns={columns}
            disableColumnMenu
            hideFooter
          />
        </Stack>
      </Container>
    </Dialog>
  )
}
