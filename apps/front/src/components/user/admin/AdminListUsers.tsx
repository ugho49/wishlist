import type { GridColDef } from '@mui/x-data-grid'
import type { FormEvent } from 'react'
import type { AdminUsersListQuery } from '../../../gql'

import { Avatar, Box, Button, Stack, styled, TextField } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card } from '@wishlist/front-components/common/Card'
import { Title } from '@wishlist/front-components/common/Title'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

import { useAdminUsersListQuery } from '../../../gql'
import { unwrapResult } from '../../../gql/result'
import { Status } from '../../common/Status'

type AdminUserRow = Extract<AdminUsersListQuery['adminUsers'], { __typename: 'AdminGetAllUsers' }>['data'][number]

const SearchButton = styled(Button)(() => ({
  padding: '8px 10px',
}))

const columns: GridColDef<AdminUserRow>[] = [
  {
    field: 'isEnabled',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: user }) => <Status color={user.isEnabled ? 'success' : 'error'} />,
  },
  {
    field: 'pictureUrl',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: user }) => (
      <Avatar src={user.pictureUrl ?? undefined} sx={{ width: '30px', height: '30px' }}>
        {user.firstName.substring(0, 1).toUpperCase()}
      </Avatar>
    ),
  },
  { field: 'firstName', headerName: 'First name', width: 170 },
  { field: 'lastName', headerName: 'Last name', width: 170 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 250 },
  {
    field: 'admin',
    headerName: 'Is Admin',
    width: 100,
    type: 'boolean',
    valueGetter: (_, row) => row.authorities.some(a => a === 'ROLE_ADMIN' || a === 'ROLE_SUPERADMIN'),
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

export const AdminListUsers = () => {
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(0)
  const { page: currentPage, search } = useSearch({ from: '/_authenticated/_with-layout/admin/users/' })
  const [inputSearch, setInputSearch] = useState(search)
  const navigate = useNavigate()

  const { data: value, isLoading: loading } = useAdminUsersListQuery(
    { input: { page: currentPage, criteria: search } },
    { select: d => unwrapResult(d.adminUsers, 'AdminGetAllUsers') },
  )

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.totalElements)
      setPageSize(value.pagination.pageSize)
    }
  }, [value])

  const applySearch = (e: FormEvent) => {
    e.preventDefault()
    void navigate({
      to: '/admin/users',
      search: prev => ({ ...prev, page: 1, search: inputSearch }),
    })
  }

  return (
    <Box>
      <Title>Liste des utilisateurs</Title>

      <Card>
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
          rows={value?.data || []}
          loading={loading}
          columns={columns}
          paginationMode="server"
          rowCount={totalElements}
          paginationModel={{
            page: currentPage - 1,
            pageSize,
          }}
          pageSizeOptions={[pageSize]}
          onPaginationModelChange={({ page }) =>
            navigate({
              to: '/admin/users',
              search: prev => ({ ...prev, page: page + 1, search }),
            })
          }
          hideFooter={totalElements <= pageSize}
        />
      </Card>
    </Box>
  )
}
