import type { GridColDef } from '@mui/x-data-grid';
import type { UserId } from '@wishlist/common';
import type { AdminEventListItem } from './admin.types';

import { Alert } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';

import { AttendeeRole, isRejection, rejectionMessage, useAdminEventListEventsQuery } from '../../../gql';
import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { EventIcon } from '../EventIcon';

const columns: GridColDef<AdminEventListItem>[] = [
  {
    field: 'icon',
    headerName: '',
    width: 44,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row }) => <EventIcon icon={row.icon ?? undefined} size="small" />,
  },
  { field: 'title', headerName: 'Titre', minWidth: 250, flex: 1 },
  {
    field: 'eventDate',
    headerName: 'Date',
    type: 'dateTime',
    width: 120,
    valueGetter: (_, row) => new Date(row.eventDate),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
  },
  {
    field: 'creator',
    headerName: 'Créateur',
    width: 170,
    valueGetter: (_, row) => {
      const creator = row.attendees.find(attendee => attendee.role === AttendeeRole.Creator)?.user;
      if (!creator) return 'Inconnu';
      return `${creator.firstName} ${creator.lastName}`;
    },
  },
  {
    field: 'nbWishlists',
    headerName: 'Listes',
    type: 'number',
    width: 90,
    valueGetter: (_, row) => row.wishlistIds.length,
  },
  {
    field: 'attendees',
    headerName: 'Participants',
    type: 'number',
    width: 120,
    valueGetter: (_, row) => row.attendees.length,
  },
  {
    field: 'createdAt',
    headerName: 'Créé le',
    type: 'dateTime',
    width: 180,
    valueGetter: (_, row) => new Date(row.createdAt),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
];

type AdminListEventsProps = {
  userId?: UserId;
  currentPage: number;
  changeCurrentPage: (page: number) => void;
};

export const AdminListEvents = ({ userId, currentPage, changeCurrentPage }: AdminListEventsProps) => {
  const navigate = useNavigate();
  const { data, isLoading: loading } = useAdminEventListEventsQuery(
    { filters: { page: currentPage, userId } },
    { select: d => d.adminEvents },
  );
  const pagedEvents = data?.__typename === 'GetEventsPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const events = pagedEvents?.data ?? [];
  const totalElements = pagedEvents?.pagination.totalElements ?? 0;
  const pageSize = pagedEvents?.pagination.pageSize ?? 10;

  if (queryRejection) {
    return <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>;
  }

  return (
    <AdminDataGrid
      clickableRows
      isRowSelectable={() => true}
      onRowClick={({ row }) => navigate({ to: `/admin/events/${row.id}` })}
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
  );
};
