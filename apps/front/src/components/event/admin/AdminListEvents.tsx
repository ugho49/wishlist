import type { GridColDef } from '@mui/x-data-grid'
import type { EventWithCountsDto, UserId } from '@wishlist/common'

import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from '@tanstack/react-router'
import { AttendeeRole } from '@wishlist/common'
import { useAdminEvents } from '@wishlist/front-hooks'
import { DateTime } from 'luxon'

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
  { field: 'title', headerName: 'Title', minWidth: 250, flex: 1 },
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
  currentPage: number
  changeCurrentPage: (page: number) => void
}

export const AdminListEvents = ({ userId, currentPage, changeCurrentPage }: AdminListEventsProps) => {
  const navigate = useNavigate()
  const { events, totalElements, pageSize, loading } = useAdminEvents({ userId, page: currentPage })

  return (
    <DataGrid
      isRowSelectable={() => true}
      disableMultipleRowSelection={true}
      disableColumnSelector={true}
      isCellEditable={() => false}
      onRowClick={data => navigate({ to: `/admin/events/${data.row.id}` })}
      density="standard"
      rows={events}
      loading={loading}
      columns={columns}
      paginationMode="server"
      localeText={{
        noRowsLabel: 'Aucun évènement',
      }}
      rowCount={totalElements}
      paginationModel={{
        page: currentPage - 1,
        pageSize,
      }}
      pageSizeOptions={[pageSize]}
      onPaginationModelChange={({ page }) => void changeCurrentPage(page + 1)}
      hideFooter={totalElements <= pageSize}
    />
  )
}
