import type { GridColDef } from '@mui/x-data-grid'
import type { AttendeeDto } from '@wishlist/common-types'

import PersonIcon from '@mui/icons-material/Person'
import { Avatar } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import React from 'react'

import { RouterLink } from '../../common/RouterLink'

const columns: GridColDef<AttendeeDto>[] = [
  {
    field: 'picture_url',
    headerName: '',
    width: 70,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: attendee }) => (
      <Avatar src={attendee.user?.picture_url} sx={{ width: '30px', height: '30px' }}>
        <PersonIcon />
      </Avatar>
    ),
  },
  {
    field: 'name',
    headerName: 'Nom',
    flex: 1,
    valueGetter: (_, row) => {
      if (!row.user) return '-'
      return `${row.user?.firstname} ${row.user?.lastname}`
    },
    renderCell: ({ row }) => {
      if (!row.user) return '-'
      return (
        <RouterLink key={row.user.id} to={`/admin/users/${row.user.id}`}>
          {row.user.firstname} {row.user.lastname}
        </RouterLink>
      )
    },
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 350,
    valueGetter: (_, row) => {
      if (!row.user) return row.pending_email
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
    valueGetter: (_, row) => !!row.pending_email,
  },
]

type AdminListAttendeesProps = {
  attendees: AttendeeDto[]
}

export const AdminListAttendees = ({ attendees }: AdminListAttendeesProps) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        isRowSelectable={() => false}
        density="standard"
        rows={attendees}
        columns={columns}
        paginationMode="client"
        hideFooterPagination
      />
    </div>
  )
}
