import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouterLink, useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { UserDto } from '@wishlist/common-types';
import { DateTime } from 'luxon';
import { Status } from '../common/Status';

type SearchType = { page: string; search: string };

const columns: GridColDef<UserDto>[] = [
  {
    field: 'is_enabled',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => <Status color={row.is_enabled ? 'success' : 'error'} />,
  },
  { field: 'firstname', headerName: 'First name', width: 170 },
  { field: 'lastname', headerName: 'Last name', width: 170 },
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'admin',
    headerName: 'Is Admin',
    width: 100,
    type: 'boolean',
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    type: 'dateTime',
    width: 150,
    valueGetter: (params) => DateTime.fromISO(params.row.created_at).toLocaleString(DateTime.DATETIME_MED),
  },
  {
    field: 'id',
    sortable: false,
    filterable: false,
    headerName: 'Actions',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: ({ row }) => <RouterLink to={`/admin/users/${row.id}`}>Voir</RouterLink>,
  },
];

export const AdminListUsers = () => {
  const api = useApi(wishlistApiRef);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchType>({ page: '1', search: '' });
  const currentPage = useMemo(() => parseInt(queryParams.page, 10), [queryParams]);
  const { value, loading } = useAsync(
    () => api.user.admin.getAll({ p: currentPage, q: queryParams.search }),
    [currentPage, queryParams.search]
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      setQueryParams((prevState) => ({ ...prevState, page: `${page}` }));
    },
    [setQueryParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      setQueryParams((prevState) => ({ ...prevState, q: search, page: '1' }));
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
