import React, { useEffect, useState } from 'react';
import { RouterLink } from '../../common/RouterLink';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { EventWithCountsDto } from '@wishlist/common-types';
import { DateTime } from 'luxon';
import { Avatar, Stack } from '@mui/material';
import { useApi } from '@wishlist-front/hooks';
import { useQuery } from '@tanstack/react-query';

const columns: GridColDef<EventWithCountsDto>[] = [
  { field: 'title', headerName: 'Title', width: 170 },
  {
    field: 'event_date',
    headerName: 'Event Date',
    type: 'dateTime',
    width: 100,
    valueGetter: ({ row: event }) => new Date(event.event_date),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_SHORT),
  },
  {
    field: 'nb_wishlists',
    headerName: '# Lists',
    type: 'number',
    width: 100,
  },
  {
    field: 'nb_attendees',
    headerName: '# Attendees',
    type: 'number',
    width: 100,
    valueGetter: ({ row: event }) => event.nb_attendees + 1,
  },
  {
    field: 'created_by',
    headerName: 'Created By',
    width: 250,
    valueGetter: ({ row: event }) => event.created_by.email,
    renderCell: ({ row: event }) => (
      <Stack direction="row" gap={1} alignItems="center">
        <Avatar src={event.created_by.picture_url} sx={{ width: '30px', height: '30px' }}>
          {event.created_by.firstname.substring(0, 1).toUpperCase()}
        </Avatar>
        <span>{event.created_by.email}</span>
      </Stack>
    ),
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    type: 'dateTime',
    width: 150,
    valueGetter: ({ row: event }) => new Date(event.created_at),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
  {
    field: 'id',
    sortable: false,
    filterable: false,
    headerName: 'Actions',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: ({ row: event }) => <RouterLink to={`/admin/events/${event.id}`}>Voir</RouterLink>,
  },
];

export const AdminListEvents = () => {
  const { admin: api } = useApi();
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['admin', 'events', { page: currentPage }],
    queryFn: () => api.event.getAll({ p: currentPage }),
  });

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements);
      setCurrentPage(value.pagination.page_number);
      setPageSize(value.pagination.pages_size);
    }
  }, [value]);

  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        autoHeight
        isRowSelectable={() => false}
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
  );
};
