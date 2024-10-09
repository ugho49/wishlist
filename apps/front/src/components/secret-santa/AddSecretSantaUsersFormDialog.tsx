import CloseIcon from '@mui/icons-material/Close'
import { LoadingButton } from '@mui/lab'
import { AppBar, Avatar, Container, Dialog, IconButton, Slide, Stack, Toolbar, Typography } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useMutation } from '@tanstack/react-query'
import { AttendeeDto, SecretSantaUserDto } from '@wishlist/common-types'
import React, { forwardRef, useMemo, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
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
  { field: 'email', headerName: 'Email', flex: 1 },
  {
    field: 'isPending',
    headerName: 'Invitation',
    display: 'flex',
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => <Status color={row.isPending ? 'warning' : 'success'} />,
  },
]

export const AddSecretSantaUsersFormDialog = ({
  open,
  secretSantaId,
  eventAttendees,
  secretSantaAttendees,
  handleSubmit,
  handleClose,
}: AddSecretSantaUsersFormDialogProps) => {
  const api = useApi()
  const { addToast } = useToast()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { mutateAsync: addUsers, isPending: loading } = useMutation({
    mutationKey: ['secret-santa.add-users', { id: secretSantaId }],
    mutationFn: () => api.secretSanta.addUsers(secretSantaId, { attendee_ids: selectedIds }),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: data => {
      handleSubmit(data.users)
    },
  })

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

  const AddButton = () => {
    if (selectedIds.length === 0) return

    return (
      <Stack alignItems="center">
        <LoadingButton
          disabled={loading}
          loading={loading}
          variant="contained"
          color="primary"
          onClick={() => addUsers()}
        >
          Ajouter {selectedIds.length} participant{selectedIds.length > 1 ? 's' : ''}
        </LoadingButton>
      </Stack>
    )
  }

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
        <AddButton />
        <DataGrid
          sx={{ marginBlock: '20px' }}
          localeText={{
            noRowsLabel: 'Aucun participant à ajouter',
          }}
          checkboxSelection
          isRowSelectable={() => !loading}
          onRowSelectionModelChange={newRowSelectionModel => setSelectedIds(newRowSelectionModel as string[])}
          rows={rows}
          columns={columns}
          autoHeight
          disableColumnMenu
          hideFooter
        />
        <AddButton />
      </Container>
    </Dialog>
  )
}
