import type { AttendeeId } from '@wishlist/common'
import type { AdminEventAttendee } from './admin.types'

import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import { Avatar } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

import { AttendeeRole } from '../../../gql'
import { ConfirmIconButton } from '../../common/ConfirmIconButton'
import { RouterLink } from '../../common/RouterLink'

type AdminListAttendeesProps = {
  attendees: AdminEventAttendee[]
  deleteAttendee: (attendeeId: AttendeeId) => void
  loading?: boolean
}

export const AdminListAttendees = ({ attendees, deleteAttendee, loading = false }: AdminListAttendeesProps) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        isRowSelectable={() => false}
        density="standard"
        localeText={{
          noRowsLabel: 'Aucun participant',
        }}
        rows={attendees}
        columns={[
          {
            field: 'picture_url',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            display: 'flex',
            renderCell: ({ row: attendee }) => (
              <Avatar src={attendee.user?.pictureUrl ?? undefined} sx={{ width: '30px', height: '30px' }}>
                <PersonIcon />
              </Avatar>
            ),
          },
          {
            field: 'name',
            headerName: 'Nom',
            flex: 1,
            minWidth: 200,
            valueGetter: (_, row) => {
              if (!row.user) return '-'
              return `${row.user?.firstName} ${row.user?.lastName}`
            },
            renderCell: ({ row }) => {
              if (!row.user) return '-'
              return (
                <RouterLink key={row.user.id} to="/admin/users/$userId" params={{ userId: row.user.id }}>
                  {row.user.firstName} {row.user.lastName}
                </RouterLink>
              )
            },
          },
          {
            field: 'email',
            headerName: 'Email',
            width: 350,
            valueGetter: (_, row) => {
              if (!row.user) return row.pendingEmail
              return row.user.email
            },
          },
          {
            field: 'role',
            width: 150,
          },
          {
            field: 'pending',
            headerName: 'Invitation ?',
            width: 150,
            type: 'boolean',
            valueGetter: (_, row) => !!row.pendingEmail,
          },
          {
            field: 'id',
            sortable: false,
            filterable: false,
            headerName: 'Actions',
            display: 'flex',
            headerAlign: 'center',
            align: 'center',
            width: 150,
            renderCell: ({ row }) => (
              <>
                <ConfirmIconButton
                  confirmTitle="Supprimer le participant"
                  confirmText="Êtes-vous sûr de vouloir supprimer ce participant ?"
                  onClick={() => deleteAttendee(row.id)}
                  disabled={row.role === AttendeeRole.Maintainer || loading}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </ConfirmIconButton>
              </>
            ),
          },
        ]}
        paginationMode="client"
        hideFooter
        disableColumnMenu
      />
    </div>
  )
}
