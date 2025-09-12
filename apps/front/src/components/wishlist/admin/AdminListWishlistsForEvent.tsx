import type { GridColDef } from '@mui/x-data-grid'
import type { WishlistWithOwnerDto } from '@wishlist/common'

import ListIcon from '@mui/icons-material/List'
import { Avatar } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { DateTime } from 'luxon'

import { RouterLink } from '../../common/RouterLink'

const columns: GridColDef<WishlistWithOwnerDto>[] = [
  {
    field: 'picture_url',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: wishlist }) => (
      <Avatar src={wishlist.logo_url} sx={{ width: '30px', height: '30px' }}>
        <ListIcon />
      </Avatar>
    ),
  },
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
  {
    field: '',
    headerName: 'Owner',
    width: 300,
    valueGetter: (_, row) => `${row.owner.firstname} ${row.owner.lastname}`,
    renderCell: ({ row }) => {
      return (
        <RouterLink key={row.owner.id} to={`/admin/users/${row.owner.id}`}>
          {row.owner.firstname} {row.owner.lastname}
        </RouterLink>
      )
    },
  },
  {
    field: 'config.hide_items',
    headerName: 'Is Public',
    width: 100,
    sortable: false,
    filterable: false,
    type: 'boolean',
    valueGetter: (_, row) => !row.config.hide_items,
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    type: 'dateTime',
    width: 200,
    valueGetter: (_, row) => new Date(row.created_at),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
]

type AdminListWishlistsForEventProps = {
  wishlists: WishlistWithOwnerDto[]
}

export const AdminListWishlistsForEvent = ({ wishlists }: AdminListWishlistsForEventProps) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        isRowSelectable={() => false}
        density="standard"
        rows={wishlists}
        columns={columns}
        paginationMode="client"
        localeText={{
          noRowsLabel: 'Aucune liste',
        }}
        hideFooter
        disableColumnMenu
      />
    </div>
  )
}
