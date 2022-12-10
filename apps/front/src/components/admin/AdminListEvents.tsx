import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouterLink, useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { EventWithCountsAndCreatorDto } from '@wishlist/common-types';
import { DateTime } from 'luxon';

type SearchType = { page: string };

const columns: GridColDef<EventWithCountsAndCreatorDto>[] = [
  { field: 'title', headerName: 'Title', width: 170 },
  {
    field: 'event_date',
    headerName: 'Event Date',
    type: 'dateTime',
    width: 100,
    valueGetter: ({ row: event }) => DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_SHORT),
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
    valueGetter: ({ row: event }) => DateTime.fromISO(event.created_at).toLocaleString(DateTime.DATETIME_MED),
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
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchType>({ page: '1' });
  const currentPage = useMemo(() => parseInt(queryParams.page, 10), [queryParams]);
  const { value, loading } = useAsync(() => api.event.admin.getAll({ p: currentPage }), [currentPage]);

  const setCurrentPage = useCallback(
    (page: number) => {
      setQueryParams((prevState) => ({ ...prevState, page: `${page}` }));
    },
    [setQueryParams]
  );

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
        pageSize={pageSize}
        paginationMode="server"
        rowCount={totalElements}
        page={currentPage - 1}
        onPageChange={(page) => setCurrentPage(page + 1)}
        rowsPerPageOptions={[pageSize]}
      />
    </div>
  );
};
