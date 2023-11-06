import React, { useEffect, useState } from 'react';
import { RouterLink, useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { EventWithCountsAndCreatorDto } from '@wishlist/common-types';
import { DateTime } from 'luxon';

const columns: GridColDef<EventWithCountsAndCreatorDto>[] = [
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
  const api = useApi(wishlistApiRef);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { value, loading } = useAsync(() => api.event.admin.getAll({ p: currentPage }), [currentPage]);

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
        onPaginationModelChange={({ page }) => setCurrentPage(page + 1)}
      />
    </div>
  );
};
