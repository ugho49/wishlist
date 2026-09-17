import type { GridColDef } from '@mui/x-data-grid';
import type { UserId } from '@wishlist/common';
import type { FormEvent } from 'react';
import type { AdminEventListItem } from './admin.types';

import { Alert, Button, Chip, styled, TextField } from '@mui/material';
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

const SearchForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexShrink: 0,
}));

const SearchButton = styled(Button)(() => ({
  padding: '8px 10px',
  flexShrink: 0,
}));

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
  search: string;
  changeCurrentPage: (page: number) => void;
  changeSearch: (search: string) => void;
  fill?: boolean;
};

export const AdminListEvents = ({
  userId,
  currentPage,
  search,
  changeCurrentPage,
  changeSearch,
  fill = false,
}: AdminListEventsProps) => {
  const navigate = useNavigate();
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [inputSearch, setInputSearch] = useState(search);
  const { data, isLoading: loading } = useAdminEventListEventsQuery(
    { filters: { page: currentPage, userId, criteria: search || undefined } },
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

  const applySearch = (e: FormEvent) => {
    e.preventDefault();
    changeSearch(inputSearch);
  };

  return (
    <>
      <SearchForm noValidate onSubmit={applySearch}>
        <TextField
          size="small"
          label="Rechercher un évènement"
          fullWidth
          placeholder="Noël, anniversaire, etc..."
          value={inputSearch}
          onChange={e => setInputSearch(e.target.value)}
        />
        <SearchButton variant="outlined" type="submit" size="small">
          Rechercher
        </SearchButton>
      </SearchForm>

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      {!queryRejection && (
        <AdminDataGrid
          fill={fill}
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
      )}
    </>
  );
};
