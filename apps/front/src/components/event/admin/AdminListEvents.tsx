import type { GridColDef } from '@mui/x-data-grid'
import type { UserId } from '@wishlist/common'
import type { AdminEventListItem } from './admin.types'

import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from '@tanstack/react-router'
import { DateTime } from 'luxon'

import { AttendeeRole, useAdminEventListEventsQuery } from '../../../gql'
import { unwrapResult } from '../../../gql/result'
import { EventIcon } from '../EventIcon'

const columns: GridColDef<AdminEventListItem>[] = [
  {
    field: 'icon',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row }) => <EventIcon icon={row.icon ?? undefined} size="small" />,
  },
  { field: 'title', headerName: 'Title', minWidth: 250, flex: 1 },
  {
    field: 'eventDate',
    headerName: 'Event Date',
    type: 'dateTime',
    width: 100,
    valueGetter: (_, row) => new Date(row.eventDate),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
  },
  {
    field: 'maintainer',
    headerName: 'Maintainer',
    width: 170,
    valueGetter: (_, row) => {
      const maintainer = row.attendees.find(attendee => attendee.role === AttendeeRole.Maintainer)?.user
      if (!maintainer) return 'Unknown'
      return `${maintainer.firstName} ${maintainer.lastName}`
    },
  },
  {
    field: 'nbWishlists',
    headerName: '# Lists',
    type: 'number',
    width: 100,
    valueGetter: (_, row) => row.wishlistIds.length,
  },
  {
    field: 'attendees',
    headerName: '# Attendees',
    type: 'number',
    width: 100,
    valueGetter: (_, row) => row.attendees.length,
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    type: 'dateTime',
    width: 200,
    valueGetter: (_, row) => new Date(row.createdAt),
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
  const { data, isLoading: loading } = useAdminEventListEventsQuery(
    { filters: { page: currentPage, userId } },
    { select: d => unwrapResult(d.adminEvents, 'GetEventsPagedResponse') },
  )

  const events = data?.data ?? []
  const totalElements = data?.pagination.totalElements ?? 0
  const pageSize = data?.pagination.pageSize ?? 0

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
