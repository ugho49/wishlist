import type { GridColDef } from '@mui/x-data-grid';
import type { FormEvent } from 'react';
import type { AdminUsersListQuery } from '../../../gql';

import { Alert, Avatar, Button, Chip, styled, TextField } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import { isRejection, rejectionMessage, useAdminUsersListQuery, useAdminUsersStatsQuery } from '../../../gql';
import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { AdminPageHeader } from '../../admin/AdminPageHeader';
import { AdminSection } from '../../admin/AdminSection';

type AdminUserRow = Extract<AdminUsersListQuery['adminUsers'], { __typename: 'AdminGetAllUsers' }>['data'][number];

const SearchForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SearchButton = styled(Button)(() => ({
  padding: '8px 10px',
  flexShrink: 0,
}));

const UserAvatar = styled(Avatar)({
  width: 28,
  height: 28,
});

const lastSessionUsedAt = (sessions: AdminUserRow['sessions']): Date | undefined => {
  let latest: Date | undefined;
  for (const session of sessions) {
    const date = new Date(session.lastUsedAt);
    if (!latest || date > latest) latest = date;
  }
  return latest;
};

const columns: GridColDef<AdminUserRow>[] = [
  {
    field: 'isEnabled',
    headerName: 'Statut',
    width: 120,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: user }) => (
      <Chip
        size="small"
        color={user.isEnabled ? 'success' : 'default'}
        label={user.isEnabled ? 'Actif' : 'Désactivé'}
      />
    ),
  },
  {
    field: 'pictureUrl',
    headerName: '',
    width: 44,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: user }) => (
      <UserAvatar src={user.pictureUrl ?? undefined}>{user.firstName.substring(0, 1).toUpperCase()}</UserAvatar>
    ),
  },
  { field: 'firstName', headerName: 'Prénom', width: 170 },
  { field: 'lastName', headerName: 'Nom', width: 170 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 250 },
  {
    field: 'lastSeenAt',
    headerName: 'Dernière activité',
    type: 'dateTime',
    width: 180,
    valueGetter: (_, row) => lastSessionUsedAt(row.sessions),
    renderCell: ({ value }) => (value ? DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED) : 'Jamais'),
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

export const AdminListUsers = () => {
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { page: currentPage, search } = useSearch({ from: '/_authenticated/_with-layout/admin/users/' });
  const [inputSearch, setInputSearch] = useState(search);
  const navigate = useNavigate();

  const { data, isLoading: loading } = useAdminUsersListQuery(
    { input: { page: currentPage, criteria: search } },
    { select: d => d.adminUsers },
  );
  const { data: statsData } = useAdminUsersStatsQuery({}, { select: d => d.adminUsersStats });
  const value = data?.__typename === 'AdminGetAllUsers' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;
  const stats = statsData?.__typename === 'AdminUsersStats' ? statsData : undefined;

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.totalElements);
      setPageSize(value.pagination.pageSize);
    }
  }, [value]);

  const applySearch = (e: FormEvent) => {
    e.preventDefault();
    void navigate({
      to: '/admin/users',
      search: prev => ({ ...prev, page: 1, search: inputSearch }),
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Utilisateurs"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Utilisateurs' }]}
        count={stats?.totalCount}
      />

      <AdminSection>
        <SearchForm noValidate onSubmit={applySearch}>
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
        </SearchForm>

        {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

        {!queryRejection && (
          <AdminDataGrid
            clickableRows
            isRowSelectable={() => true}
            localeText={{
              noRowsLabel: 'Aucun utilisateur',
            }}
            onRowClick={({ row }) => navigate({ to: '/admin/users/$userId', params: { userId: row.id } })}
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
        )}
      </AdminSection>
    </>
  );
};
