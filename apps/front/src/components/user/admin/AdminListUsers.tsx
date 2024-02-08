import React, { FormEvent, useEffect, useState } from 'react';
import { RouterLink } from '../../common/RouterLink';
import { useApi } from '@wishlist-front/hooks';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { UserDto } from '@wishlist/common-types';
import { DateTime } from 'luxon';
import { Status } from '../../common/Status';
import { Avatar, Box, Button, Stack, TextField } from '@mui/material';
import { InputLabel } from '../../common/InputLabel';
import { useQuery } from '@tanstack/react-query';

const columns: GridColDef<UserDto>[] = [
  {
    field: 'is_enabled',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    renderCell: ({ row: user }) => <Status color={user.is_enabled ? 'success' : 'error'} />,
  },
  {
    field: 'picture_url',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    renderCell: ({ row: user }) => (
      <Avatar src={user.picture_url} sx={{ width: '30px', height: '30px' }}>
        {user.firstname.substring(0, 1).toUpperCase()}
      </Avatar>
    ),
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
    valueGetter: ({ row: user }) => new Date(user.created_at),
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
    renderCell: ({ row: user }) => <RouterLink to={`/admin/users/${user.id}`}>Voir</RouterLink>,
  },
];

export const AdminListUsers = () => {
  const { admin: api } = useApi();
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');

  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['admin', 'users', { page: currentPage, search }],
    queryFn: () => api.user.getAll({ p: currentPage, q: search }),
  });

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements);
      setCurrentPage(value.pagination.page_number);
      setPageSize(value.pagination.pages_size);
    }
  }, [value]);

  const applySearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(inputSearch);
  };

  return (
    <div style={{ width: '100%' }}>
      <Box component="form" noValidate onSubmit={applySearch}>
        <InputLabel>Rechercher un utilisateur</InputLabel>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} mb={2}>
          <Stack flexGrow={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="John Doe, john@doe.fr, john, etc..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
            />
          </Stack>
          <Button variant="outlined" type="submit">
            Rechercher
          </Button>
        </Stack>
      </Box>
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
