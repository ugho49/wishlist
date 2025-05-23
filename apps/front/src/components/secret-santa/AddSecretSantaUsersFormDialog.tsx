import type { TransitionProps } from '@mui/material/transitions'
import type { GridColDef } from '@mui/x-data-grid'
import type { AttendeeDto, AttendeeId, SecretSantaUserDto } from '@wishlist/common-types'

import CloseIcon from '@mui/icons-material/Close'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import { AppBar, Avatar, Button, Container, Dialog, IconButton, Slide, Stack, Toolbar, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'

import { useApi, useToast } from '../../hooks'
import { Status } from '../common/Status'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  const { children, ...other } = props
  return <Slide direction="up" ref={ref} {...other} children={children} />
})

export type AddSecretSantaUsersFormDialogProps = {
  open: boolean
  eventId: string
  secretSantaId: string
  eventAttendees: AttendeeDto[]
  secretSantaAttendees: AttendeeDto[]
  handleSubmit: (newSecretSantaUsers: SecretSantaUserDto[]) => void
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
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'isPending',
    headerName: 'Status',
    display: 'flex',
    sortable: true,
    filterable: false,
    width: 200,
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
  const api = useApi()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [selectedIds, setSelectedIds] = useState<AttendeeId[]>([])

  const { mutateAsync: addUsers, isPending: loading } = useMutation({
    mutationKey: ['secret-santa.add-users', { id: secretSantaId }],
    mutationFn: () => api.secretSanta.addUsers(secretSantaId, { attendee_ids: selectedIds }),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async data => {
      handleSubmit(data.users)
      await queryClient.invalidateQueries({ queryKey: ['secret-santa', { eventId }] })
    },
  })

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
        firstname: a.user?.firstname,
        lastname: a.user?.lastname,
        email: a.user?.email ?? a.pending_email ?? '',
        pictureUrl: a.user?.picture_url,
        isPending: !!a.pending_email,
      }))
  }, [eventAttendees, secretSantaAttendees])

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={loading}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
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
