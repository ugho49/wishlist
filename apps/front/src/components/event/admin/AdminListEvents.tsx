import type { GridColDef } from '@mui/x-data-grid';
import type { UserId } from '@wishlist/common';
import type { AdminEventListItem } from './admin.types';

import { Alert, Chip } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import {
  AttendeeRole,
  isRejection,
  rejectionMessage,
  SecretSantaStatus,
  useAdminEventListEventsQuery,
} from '../../../gql';
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
    headerAlign: 'center',
    align: 'center',
    width: 90,
    valueGetter: (_, row) => row.wishlistIds.length,
  },
  {
    field: 'attendees',
    headerName: 'Participants',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    width: 120,
    valueGetter: (_, row) => row.attendees.length,
  },
  {
    field: 'secretSanta',
    headerName: 'Secret Santa',
    headerAlign: 'center',
    align: 'center',
    width: 150,
    sortable: false,
    filterable: false,
    display: 'flex',
    valueGetter: (_, row) => row.secretSanta?.status,
    renderCell: ({ row }) => {
      if (!row.secretSanta) return '—';
      const isActive = row.secretSanta.status === SecretSantaStatus.Started;
      return <Chip size="small" color={isActive ? 'success' : 'default'} label={isActive ? 'Actif' : 'Brouillon'} />;
    },
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
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading: loading } = useAdminEventListEventsQuery(
    { filters: { page: currentPage, userId } },
    { select: d => d.adminEvents, placeholderData: keepPreviousData },
  );
  const pagedEvents = data?.__typename === 'GetEventsPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const events = pagedEvents?.data ?? [];

  useEffect(() => {
    if (pagedEvents) {
      setTotalElements(pagedEvents.pagination.totalElements);
      setPageSize(pagedEvents.pagination.pageSize);
    }
  }, [pagedEvents]);

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
      onPaginationModelChange={({ page }) => {
        const nextPage = page + 1;
        if (nextPage === currentPage) return;
        changeCurrentPage(nextPage);
      }}
      hideFooter={totalElements <= pageSize}
    />
  );
};
