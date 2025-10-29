import type { GridColDef } from '@mui/x-data-grid'
import type { UserId, WishlistWithEventsDto } from '@wishlist/common'

import ListIcon from '@mui/icons-material/List'
import { Avatar, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

import { useApi } from '../../../hooks'
import { RouterLink } from '../../common/RouterLink'

const columns: GridColDef<WishlistWithEventsDto>[] = [
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
  { field: 'title', headerName: 'Title', width: 250 },
  {
    field: '',
    headerName: 'Events',
    flex: 1,
    minWidth: 250,
    resizable: true,
    valueGetter: (_, row) => row.events.map(event => event.title).join(', '),
    renderCell: ({ row }) => {
      return (
        <Stack gap={1} direction="row">
          {row.events.map(event => (
            <RouterLink key={event.id} to="/admin/events/$eventId" params={{ eventId: event.id }}>
              {event.title}
            </RouterLink>
          ))}
        </Stack>
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

type AdminListWishlistsForUserProps = {
  userId: UserId
}

export const AdminListWishlistsForUser = ({ userId }: AdminListWishlistsForUserProps) => {
  const { admin: api } = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['admin', 'wishlists', { page: currentPage, userId }],
    queryFn: ({ signal }) => api.wishlist.getAll({ p: currentPage, user_id: userId }, { signal }),
  })

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
      setCurrentPage(value.pagination.page_number)
      setPageSize(value.pagination.pages_size)
    }
  }, [value])

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        isRowSelectable={() => false}
        density="standard"
        rows={value?.resources || []}
        loading={loading}
        columns={columns}
        paginationMode="server"
        localeText={{
          noRowsLabel: 'Aucune liste',
        }}
        rowCount={totalElements}
        paginationModel={{
          page: currentPage - 1,
          pageSize,
        }}
        pageSizeOptions={[pageSize]}
        onPaginationModelChange={({ page }) => setCurrentPage(page + 1)}
        hideFooter={totalElements <= pageSize}
      />
    </div>
  )
}
