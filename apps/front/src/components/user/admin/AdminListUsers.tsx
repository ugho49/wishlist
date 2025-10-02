import type { GridColDef } from '@mui/x-data-grid'
import type { UserWithoutSocialsDto } from '@wishlist/common'
import type { FormEvent } from 'react'

import { Avatar, Box, Button, Stack, styled, TextField } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { useApi } from '../../../hooks'
import { Status } from '../../common/Status'

const SearchButton = styled(Button)(() => ({
  padding: '8px 10px',
}))

const columns: GridColDef<UserWithoutSocialsDto>[] = [
  {
    field: 'is_enabled',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: user }) => <Status color={user.is_enabled ? 'success' : 'error'} />,
  },
  {
    field: 'picture_url',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: user }) => (
      <Avatar src={user.picture_url} sx={{ width: '30px', height: '30px' }}>
        {user.firstname.substring(0, 1).toUpperCase()}
      </Avatar>
    ),
  },
  { field: 'firstname', headerName: 'First name', width: 170 },
  { field: 'lastname', headerName: 'Last name', width: 170 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 250 },
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
    width: 200,
    valueGetter: (_, row) => new Date(row.created_at),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
]

export const AdminListUsers = () => {
  const { admin: api } = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [inputSearch, setInputSearch] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['admin', 'users', { page: currentPage, search }],
    queryFn: ({ signal }) => api.user.getAll({ p: currentPage, q: search }, { signal }),
  })

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
      setCurrentPage(value.pagination.page_number)
      setPageSize(value.pagination.pages_size)
    }
  }, [value])

  const applySearch = (e: FormEvent) => {
    e.preventDefault()
    setSearch(inputSearch)
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        component="form"
        noValidate
        onSubmit={applySearch}
        mb={5}
      >
        <TextField
          size="small"
          label="Rechercher un utilisateur"
          fullWidth
          placeholder="John Doe, john@doe.fr, john, etc..."
          value={inputSearch}
          onChange={e => setInputSearch(e.target.value)}
        />
        <SearchButton variant="outlined" type="submit" size="small">
          Rechercher
        </SearchButton>
      </Stack>

      <DataGrid
        isRowSelectable={() => true}
        disableMultipleRowSelection={true}
        disableColumnSelector={true}
        isCellEditable={() => false}
        localeText={{
          noRowsLabel: 'Aucun utilisateur',
        }}
        onRowClick={data => navigate({ to: '/admin/users/$userId', params: { userId: data.row.id } })}
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
        hideFooter={totalElements <= pageSize}
      />
    </Box>
  )
}
