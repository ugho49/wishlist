import type { GridColDef } from '@mui/x-data-grid'
import type { EventWithCountsDto, UserId } from '@wishlist/common'

import { DataGrid } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { AttendeeRole } from '@wishlist/common'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApi } from '../../../hooks'
import { EventIcon } from '../EventIcon'

const columns: GridColDef<EventWithCountsDto>[] = [
  {
    field: 'icon',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row }) => <EventIcon icon={row.icon} size="small" />,
  },
  { field: 'title', headerName: 'Title', flex: 1 },
  {
    field: 'event_date',
    headerName: 'Event Date',
    type: 'dateTime',
    width: 100,
    valueGetter: (_, row) => new Date(row.event_date),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
  },
  {
    field: '',
    headerName: 'Maintainer',
    width: 170,
    valueGetter: (_, row) => {
      const maintainer = row.attendees.find(attendee => attendee.role === AttendeeRole.MAINTAINER)?.user
      if (!maintainer) return 'Unknown'
      return `${maintainer.firstname} ${maintainer.lastname}`
    },
  },
  {
    field: 'nb_wishlists',
    headerName: '# Lists',
    type: 'number',
    width: 100,
  },
  {
    field: 'attendees',
    headerName: '# Attendees',
    type: 'number',
    width: 100,
    valueGetter: (_, row) => row.attendees.length,
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

type AdminListEventsProps = {
  userId?: UserId
}

export const AdminListEvents = ({ userId }: AdminListEventsProps) => {
  const { admin: api } = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['admin', 'events', { page: currentPage, userId }],
    queryFn: ({ signal }) => api.event.getAll({ p: currentPage, user_id: userId }, { signal }),
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
        isRowSelectable={() => true}
        disableMultipleRowSelection={true}
        disableColumnSelector={true}
        isCellEditable={() => false}
        onRowClick={data => navigate(`/admin/events/${data.row.id}`)}
        density="standard"
        rows={value?.resources || []}
        loading={loading}
        columns={columns}
        paginationMode="server"
        rowCount={totalElements}
        paginationModel={{
          page: currentPage - 1,
          pageSize,
        }}
        pageSizeOptions={[pageSize]}
        onPaginationModelChange={({ page }) => setCurrentPage(page + 1)}
      />
    </div>
  )
}
